import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = dirname(fileURLToPath(import.meta.url));
const organizationShared = resolve(root, '../organizations/shared');
const output = resolve(root, 'dist');

const staticEntries = [
  'tutorial',
  'style.css',
  'index.html',
  'robots.txt',
  'config.js'
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of staticEntries) {
  await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
}

await mkdir(resolve(output, 'shared'), { recursive: true });
const demoUsers = JSON.parse(await readFile(resolve(root, '../containerization/demo-users.json'), 'utf8'));
await writeFile(
  resolve(output, 'shared/demo-users.global.js'),
  `window.SovereignDemoUsers = Object.freeze(${JSON.stringify(demoUsers)});\n`
);
for (const entry of ['pod-state.js', 'pod-storage.js', 'pod-config.js']) {
  await cp(resolve(organizationShared, entry), resolve(output, 'shared', entry));
}

await build({
  entryPoints: [resolve(organizationShared, 'solid-session.js')],
  bundle: true,
  nodePaths: [resolve(root, 'node_modules')],
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  outfile: resolve(output, 'shared/solid-session.js')
});
