import assert from 'node:assert/strict';
import test from 'node:test';
import organizationWorker from '../cloudflare/organization-worker.js';
import { loadOrganizations, readJson } from './helpers.js';

const hostnameAliases = {
  nolichucky_family_clinic: 'nolichucky',
  riverbend_dental_clinic: 'riverbend',
  united_states_passport_office: 'passport',
  state_driver_licensing_agency: 'driver-license'
};

test('all trust relationships resolve to configured organizations', async () => {
  const organizations = await loadOrganizations();
  for (const [id, entry] of Object.entries(organizations)) {
    for (const peer of entry.trust.trustedOrganizations) {
      assert.ok(organizations[peer.id], `${id} trusts missing organization ${peer.id}`);
      assert.ok(Array.isArray(peer.relationships) && peer.relationships.length > 0);
      assert.doesNotThrow(() => new URL(peer.apiUrl));
    }
  }
});

test('trusted peers expose compatible health, trust, and presentation operations', async () => {
  const organizations = await loadOrganizations();
  const required = new Set(['GET /health', 'GET /trust', 'POST /presentations/submit']);
  for (const [id, entry] of Object.entries(organizations)) {
    for (const peer of entry.trust.trustedOrganizations) {
      const peerOperations = new Set(organizations[peer.id].api.operations.map(({ method, path }) => `${method} ${path}`));
      for (const operation of required) {
        assert.ok(peerOperations.has(operation), `${id} cannot interoperate with ${peer.id}: missing ${operation}`);
      }
    }
  }
});

test('demo trust policy connects every organization to every other organization', async () => {
  const organizations = await loadOrganizations();
  const policy = await readJson('organizations', 'demo-trust-policy.json');
  assert.equal(policy.mode, 'all-organizations');

  const ids = Object.keys(organizations);
  for (const id of ids) {
    const hostname = hostnameAliases[id] || organizations[id].directory;
    const response = await organizationWorker.fetch(
      new Request(`https://${hostname}.api.demo.sovereign.ngo/trust`),
      {}
    );
    assert.equal(response.status, 200);
    const trust = await response.json();
    assert.equal(trust.organizationId, id);
    assert.equal(trust.trustedOrganizations.length, ids.length - 1);
    assert.deepEqual(
      new Set(trust.trustedOrganizations.map((peer) => peer.id)),
      new Set(ids.filter((peerId) => peerId !== id))
    );
  }
});

test('credential policies only reference their owning organization', async () => {
  const organizations = await loadOrganizations();
  for (const [id, entry] of Object.entries(organizations)) {
    if (entry.credentialsIssue.organizationId) assert.equal(entry.credentialsIssue.organizationId, id);
    assert.equal(entry.credentialsVerify.organizationId, id);
    assert.ok(entry.credentialsVerify.verificationMethod || entry.credentialsVerify.credentials);
  }
});
