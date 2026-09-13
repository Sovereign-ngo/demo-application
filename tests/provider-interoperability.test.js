import assert from 'node:assert/strict';
import test from 'node:test';
import { loadOrganizations } from './helpers.js';

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

test('credential policies only reference their owning organization', async () => {
  const organizations = await loadOrganizations();
  for (const [id, entry] of Object.entries(organizations)) {
    if (entry.credentialsIssue.organizationId) assert.equal(entry.credentialsIssue.organizationId, id);
    assert.equal(entry.credentialsVerify.organizationId, id);
    assert.ok(entry.credentialsVerify.verificationMethod || entry.credentialsVerify.credentials);
  }
});
