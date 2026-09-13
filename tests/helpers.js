import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import vm from 'node:vm';

export const root = resolve(import.meta.dirname, '..');
export const readJson = async (...parts) => JSON.parse(await readFile(resolve(root, ...parts), 'utf8'));

export const loadOrganizations = async () => {
  const base = resolve(root, 'organizations');
  const sharedBehaviors = await readJson('organizations', 'nolichucky-family-clinic', 'behaviors.json');
  const entries = await readdir(base, { withFileTypes: true });
  const rows = await Promise.all(entries
    .filter((entry) => entry.isDirectory() && entry.name !== 'shared')
    .map(async (entry) => {
      const directory = entry.name;
      return {
        directory,
        organization: await readJson('organizations', directory, 'organization.json'),
        api: await readJson('organizations', directory, 'api.json'),
        trust: await readJson('organizations', directory, 'trust.json'),
        behaviors: null,
        credentialsIssue: await readJson('organizations', directory, 'credentials-issue.json'),
        credentialsVerify: await readJson('organizations', directory, 'credentials-verify.json')
      };
    }));
  for (const row of rows) {
    const organizationBehaviors = await readJson('organizations', row.directory, 'behaviors.json');
    row.behaviors = { ...sharedBehaviors, ...organizationBehaviors, configMap: organizationBehaviors.configMap };
  }
  return Object.fromEntries(rows.map((row) => [row.organization.id, row]));
};

export const loadBrowserGlobal = async (path, globalName) => {
  const window = {};
  vm.runInNewContext(await readFile(resolve(root, path), 'utf8'), { window, console });
  return window[globalName];
};

export const loadMemoryPodState = async () => {
  const context = {
    console,
    crypto: globalThis.crypto,
    structuredClone,
    TextEncoder,
    TextDecoder,
    URL
  };
  context.window = context;
  context.globalThis = context;
  context.SovereignDemoUsers = await readJson('containerization', 'demo-users.json');
  context.SovereignPodConfig = { backend: { mode: 'memory' } };
  for (const file of [
    'webapp/tutorial/provider-catalog.global.js',
    'organizations/shared/pod-storage.js',
    'organizations/shared/pod-state.js'
  ]) {
    vm.runInNewContext(await readFile(resolve(root, file), 'utf8'), context, { filename: file });
  }
  return context.SovereignPodState;
};
