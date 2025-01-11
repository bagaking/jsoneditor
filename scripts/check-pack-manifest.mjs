import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const requiredPackageFiles = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/style.css'
];

const requiredDistFiles = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/style.css'
];

const stalePackageFilePattern = new RegExp('^dist/jsoneditor(?:[.]umd)?[.](?:js|cjs)(?:[.]map)?$');
const staleDistFilePattern = new RegExp('^jsoneditor(?:[.]umd)?[.](?:js|cjs)(?:[.]map)?$');
const jsArtifactPattern = new RegExp('[.](?:js|cjs|map)$');
const bundledReactDomClientPattern = new RegExp('node_modules/.*react-dom/.*client|react-dom/cjs/react-dom.*client');
const esReactDomClientExternalPattern = new RegExp('from ["\']react-dom/client["\']');
const cjsReactDomClientExternalPattern = new RegExp('require[(]["\']react-dom/client["\'][)]');
const jsEntryPattern = new RegExp('(?:^|/)index\\d*[.]js$');
const cjsEntryPattern = new RegExp('(?:^|/)index\\d*[.]cjs$');

const errors = [];

for (const file of requiredDistFiles) {
  if (!existsSync(file)) {
    errors.push(`Missing ${file}. Run pnpm build before packing.`);
  }
}

const dryRun = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
});
const [pack] = JSON.parse(dryRun);
const packageFiles = new Set(pack.files.map((file) => file.path));

for (const file of requiredPackageFiles) {
  if (!packageFiles.has(file)) {
    errors.push(`Packed package is missing ${file}.`);
  }
}

for (const file of packageFiles) {
  if (stalePackageFilePattern.test(file)) {
    errors.push(`Packed package contains stale dist artifact ${file}.`);
  }
}

const listFiles = (dir) => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
};

const distFiles = listFiles('dist');
const distEntries = existsSync('dist') ? readdirSync('dist') : [];
for (const entry of distEntries) {
  if (staleDistFilePattern.test(entry)) {
    errors.push(`dist contains stale artifact dist/${entry}.`);
  }
}

const distFilesToScan = distFiles.filter((file) => jsArtifactPattern.test(file));

for (const file of distFilesToScan) {
  const content = readFileSync(file, 'utf8');
  if (bundledReactDomClientPattern.test(content)) {
    errors.push(`${file} appears to include bundled React DOM client source instead of leaving it external.`);
  }
}

if (!distFilesToScan.some((file) => jsEntryPattern.test(file) && esReactDomClientExternalPattern.test(readFileSync(file, 'utf8')))) {
  errors.push('ES build does not leave react-dom/client as an external import.');
}

if (!distFilesToScan.some((file) => cjsEntryPattern.test(file) && cjsReactDomClientExternalPattern.test(readFileSync(file, 'utf8')))) {
  errors.push('CommonJS build does not leave react-dom/client as an external require.');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Pack manifest check passed.');
