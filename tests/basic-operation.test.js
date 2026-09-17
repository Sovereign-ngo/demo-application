import assert from 'node:assert/strict';
import test from 'node:test';
import { loadOrganizations, readJson } from './helpers.js';
import organizationWorker from '../cloudflare/organization-worker.js';

test('prepared users have unique accounts, pods, records, and credentials', async () => {
  const users = await readJson('containerization', 'demo-users.json');
  assert.ok(users.length >= 5);
  assert.equal(new Set(users.map((user) => user.email)).size, users.length);
  assert.equal(new Set(users.flatMap((user) => user.pods.map((pod) => pod.name))).size, users.length);
  for (const user of users) {
    assert.ok(user.profile.displayName);
    assert.ok(user.profile.description);
    assert.ok(user.password);
    assert.equal(user.pods.length, 1);
    assert.ok(user.pods[0].records.length > 0);
    assert.ok(user.pods[0].credentials.length > 0);
  }
});

test('every organization exposes the standard API surface', async () => {
  const organizations = await loadOrganizations();
  assert.equal(Object.keys(organizations).length, 49);
  const required = ['GET /health', 'GET /info', 'GET /trust', 'GET /config.js', 'POST /presentations/submit'];
  for (const [id, entry] of Object.entries(organizations)) {
    assert.equal(entry.trust.organizationId, id);
    if (entry.credentialsIssue.organizationId) assert.equal(entry.credentialsIssue.organizationId, id);
    assert.equal(entry.credentialsVerify.organizationId, id);
    const operations = entry.api.operations.map(({ method, path }) => `${method} ${path}`);
    assert.deepEqual(operations, required, `${id} has a non-standard API surface`);
  }
});

test('local provider contracts use operations supported by the local server', async () => {
  const organizations = await loadOrganizations();
  const supportedHandlers = new Set(['health', 'info', 'trust', 'config', 'submitPresentation']);
  for (const [id, entry] of Object.entries(organizations)) {
    for (const operation of entry.api.operations) {
      assert.ok(supportedHandlers.has(operation.handler), `${id} uses unsupported handler ${operation.handler}`);
    }
  }
});

test('shared organization Worker selects production hosts and local container IDs', async () => {
  const production = await organizationWorker.fetch(
    new Request('https://passport.api.demo.sovereign.ngo/health'),
    {}
  );
  assert.equal(production.status, 200);
  assert.equal((await production.json()).organizationId, 'united_states_passport_office');

  const local = await organizationWorker.fetch(
    new Request('http://localhost:8787/health'),
    { ORGANIZATION_ID: 'riverbend_dental_clinic' }
  );
  assert.equal(local.status, 200);
  assert.equal((await local.json()).organizationId, 'riverbend_dental_clinic');

  let assetPath;
  const portal = await organizationWorker.fetch(
    new Request('https://riverstone-radiology-center.api.demo.sovereign.ngo/shared/pod-config.js'),
    {
      ASSETS: {
        fetch(request) {
          assetPath = new URL(request.url).pathname;
          return new Response('asset');
        }
      }
    }
  );
  assert.equal(portal.status, 200);
  assert.equal(assetPath, '/riverstone-radiology-center/shared/pod-config.js');
});
