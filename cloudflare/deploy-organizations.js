import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const organizationRoot = resolve(root, 'organizations');
const wrangler = resolve(import.meta.dirname, 'node_modules/.bin/wrangler');
const config = resolve(import.meta.dirname, 'wrangler.organization.jsonc');
const dryRun = process.argv.includes('--dry-run');
const hostnameOverrides = {
  nolichucky_family_clinic: 'nolichucky.api.demo.sovereign.ngo',
  riverbend_dental_clinic: 'riverbend.api.demo.sovereign.ngo',
  united_states_passport_office: 'passport.api.demo.sovereign.ngo',
  state_driver_licensing_agency: 'driver-license.api.demo.sovereign.ngo'
};

const entries = await readdir(organizationRoot, { withFileTypes: true });
const organizations = [];
for (const entry of entries) {
  if (!entry.isDirectory() || entry.name === 'shared') continue;
  const definition = JSON.parse(await readFile(resolve(organizationRoot, entry.name, 'organization.json'), 'utf8'));
  organizations.push({ directory: entry.name, ...definition });
}
organizations.sort((a, b) => a.id.localeCompare(b.id));

for (const organization of organizations) {
  const hostname = hostnameOverrides[organization.id] || `${organization.directory}.api.demo.sovereign.ngo`;
  const args = [
    'deploy',
    '--config', config,
    '--name', `sovereign-demo-org-${organization.directory}`,
    '--assets', resolve(organizationRoot, organization.directory, 'dist'),
    '--var', `ORGANIZATION_ID:${organization.id}`,
    '--var', `ORGANIZATION_API_URL:https://${hostname}/`,
    '--domain', hostname
  ];
  if (dryRun) args.push('--dry-run');
  console.log(`${dryRun ? 'Checking' : 'Deploying'} ${organization.name} (${hostname})`);
  const result = spawnSync(wrangler, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
