import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const organizationEntries = await readdir(resolve(root, 'organizations'), { withFileTypes: true });
const organizations = organizationEntries
  .filter((entry) => entry.isDirectory() && entry.name !== 'shared')
  .map((entry) => entry.name)
  .sort();
const cloudflareOutput = resolve(root, 'cloudflare', 'organization-assets');
await rm(cloudflareOutput, { recursive: true, force: true });
await mkdir(cloudflareOutput, { recursive: true });
const sharedBehaviors = JSON.parse(await readFile(
  resolve(root, 'organizations', 'nolichucky-family-clinic', 'behaviors.json'),
  'utf8'
));

for (const organization of organizations) {
  const organizationRoot = resolve(root, 'organizations', organization);
  const output = resolve(organizationRoot, 'dist');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  const organizationHtml = (await readFile(resolve(organizationRoot, 'index.html'), 'utf8'))
    .replace('<script src="/shared/solid-session.js"></script>', '<script src="/shared/demo-users.global.js"></script>\n  <script src="/shared/solid-session.js"></script>');
  await writeFile(resolve(output, 'index.html'), organizationHtml);
  await cp(resolve(root, 'webapp/dist/shared'), resolve(output, 'shared'), { recursive: true });
  await mkdir(resolve(output, 'tutorial/shared'), { recursive: true });
  await cp(
    resolve(root, 'webapp/dist/tutorial/provider-catalog.global.js'),
    resolve(output, 'tutorial/provider-catalog.global.js')
  );
  await cp(
    resolve(root, 'webapp/dist/tutorial/shared/bridge.global.js'),
    resolve(output, 'tutorial/shared/bridge.global.js')
  );
  await mkdir(resolve(output, 'config'), { recursive: true });

  const organizationBehaviors = JSON.parse(await readFile(resolve(organizationRoot, 'behaviors.json'), 'utf8'));
  const behaviors = {
    ...sharedBehaviors,
    ...organizationBehaviors,
    configMap: organizationBehaviors.configMap
  };
  await writeFile(
    resolve(output, 'config/behaviors.js'),
    `window.SovereignProviderBehavior = Object.freeze(${JSON.stringify(behaviors)});\n`
  );

  const credentials = JSON.parse(await readFile(resolve(organizationRoot, 'credentials-issue.json'), 'utf8'));
  if (credentials.profiles && credentials.defaultProfile) {
    const profileConfigs = Object.fromEntries(Object.entries(credentials.profiles).map(([id, profile]) => [
      id,
      { ...profile, issuerProviderId: credentials.organizationId }
    ]));
    const browserConfig = { profileConfigs, defaultProfile: credentials.defaultProfile };
    await writeFile(
      resolve(output, 'config/credentials-issue.js'),
      `window.SovereignVerifierProfiles = Object.freeze(${JSON.stringify(browserConfig)});\n`
    );
  }

  await cp(output, resolve(cloudflareOutput, organization), { recursive: true });
}
