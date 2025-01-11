import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

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

const alwaysAllowedPackageFiles = new Set([
  'package.json',
  'README.md',
  'README.en.md',
  'LICENSE'
]);
const rootCjsFiles = new Set(['dist/index.cjs', 'dist/index.cjs.map']);
const cjsChunkPattern = new RegExp('^dist/index\\d+[.]cjs$');
const jsArtifactPattern = new RegExp('[.](?:js|cjs|map)$');
const localImportPattern = new RegExp(
  String.raw`(?:import\s+(?:[^'"]+\s+from\s+)?|export\s+(?:[^'"]+\s+from\s+)?|require\()\s*["'](\.{1,2}/[^"']+)["']`,
  'g'
);
const bundledReactDomClientPattern = new RegExp('node_modules/.*react-dom/.*client|react-dom/cjs/react-dom.*client');
const esReactDomClientExternalPattern = new RegExp('from ["\']react-dom/client["\']');
const cjsReactDomClientExternalPattern = new RegExp('require[(]["\']react-dom/client["\'][)]');

const errors = [];

const toPosix = (path) => path.split('\\').join('/');

const listFiles = (dir) => {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(path) : [toPosix(path)];
  });
};

const sourceModulePattern = new RegExp('[.](?:ts|tsx)$');
const runtimeModuleExtensions = ['.js', '.cjs'];

const isRuntimeModule = (file) => runtimeModuleExtensions.some((extension) => file.endsWith(extension));

const srcModules = listFiles('src').filter((file) => sourceModulePattern.test(file));
const sourceModuleArtifacts = new Set();

for (const file of srcModules) {
  const distPath = file.startsWith('src/') ? `dist/${file.slice('src/'.length)}` : file;
  const base = distPath.replace(sourceModulePattern, '');

  for (const extension of ['.js', '.js.map', '.d.ts', '.d.ts.map']) {
    sourceModuleArtifacts.add(`${base}${extension}`);
  }
}

const resolveLocalArtifact = (fromFile, specifier) => {
  if (!specifier.startsWith('.')) {
    return null;
  }

  return toPosix(normalize(join(dirname(fromFile), specifier)));
};

const localImportsFrom = (file) => {
  if (!existsSync(file) || !isRuntimeModule(file)) {
    return [];
  }

  const content = readFileSync(file, 'utf8');
  const imports = [];
  for (const match of content.matchAll(localImportPattern)) {
    const resolved = resolveLocalArtifact(file, match[1]);
    if (resolved && existsSync(resolved) && isRuntimeModule(resolved)) {
      imports.push(resolved);
    }
  }
  return imports;
};

const reachableRuntimeArtifacts = (entries) => {
  const visited = new Set();
  const pending = [...entries];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file) || !existsSync(file)) {
      continue;
    }

    visited.add(file);
    for (const imported of localImportsFrom(file)) {
      pending.push(imported);
    }
  }

  return visited;
};

const reachableJsFiles = reachableRuntimeArtifacts(['dist/index.js', 'dist/index.cjs']);
const allowedDistFiles = new Set([
  ...requiredDistFiles,
  ...sourceModuleArtifacts,
  ...rootCjsFiles,
  'dist/style.css'
]);

for (const file of reachableJsFiles) {
  allowedDistFiles.add(file);
  allowedDistFiles.add(`${file}.map`);
}

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
  if (file.startsWith('dist/')) {
    if (!allowedDistFiles.has(file)) {
      errors.push(`Packed package contains unexpected dist artifact ${file}.`);
    }
  } else if (!alwaysAllowedPackageFiles.has(file)) {
    errors.push(`Packed package contains unexpected file ${file}.`);
  }
}

const distFiles = listFiles('dist');

for (const file of distFiles) {
  if (!allowedDistFiles.has(file)) {
    errors.push(`dist contains unexpected artifact ${file}.`);
  }

  if (cjsChunkPattern.test(file) && !reachableJsFiles.has(file)) {
    errors.push(`dist contains unreachable CommonJS chunk ${file}.`);
  }
}

const distFilesToScan = distFiles.filter((file) => jsArtifactPattern.test(file));

for (const file of distFilesToScan) {
  const content = readFileSync(file, 'utf8');
  if (bundledReactDomClientPattern.test(content)) {
    errors.push(`${file} appears to include bundled React DOM client source instead of leaving it external.`);
  }
}

if (![...reachableJsFiles].some((file) => file.endsWith('.js') && esReactDomClientExternalPattern.test(readFileSync(file, 'utf8')))) {
  errors.push('ES build does not leave react-dom/client as an external import.');
}

if (![...reachableJsFiles].some((file) => file.endsWith('.cjs') && cjsReactDomClientExternalPattern.test(readFileSync(file, 'utf8')))) {
  errors.push('CommonJS build does not leave react-dom/client as an external require.');
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Pack manifest check passed.');
