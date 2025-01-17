import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const packageManifest = JSON.parse(readFileSync('package.json', 'utf8'));
const tempDir = mkdtempSync(join(tmpdir(), 'jsoneditor-entrypoints-'));
const packageName = packageManifest.name;
const styleSubpath = `${packageName}${String.fromCharCode(47)}style.css`;
const styleDistSuffix = `${String.fromCharCode(47)}dist${String.fromCharCode(47)}style.css`;
const errors = [];

const run = (command, args, options = {}) => {
  try {
    return execFileSync(command, args, {
      cwd: tempDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });
  } catch (error) {
    const output = [error.stdout, error.stderr].filter(Boolean).join('\n').trim();
    errors.push(`${command} ${args.join(' ')} failed${output ? `:\n${output}` : '.'}`);
    return '';
  }
};

try {
  writeFileSync(
    join(tempDir, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'module',
        dependencies: {
          [packageName]: `file:${process.cwd()}`
        },
        devDependencies: {
          typescript: packageManifest.devDependencies?.typescript,
          react: packageManifest.devDependencies?.react,
          'react-dom': packageManifest.devDependencies?.['react-dom'],
          '@types/react': packageManifest.devDependencies?.['@types/react'],
          '@types/react-dom': packageManifest.devDependencies?.['@types/react-dom']
        }
      },
      null,
      2
    )
  );

  writeFileSync(
    join(tempDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          noEmit: true
        },
        include: ['smoke.tsx']
      },
      null,
      2
    )
  );

  writeFileSync(
    join(tempDir, 'smoke.mjs'),
    [
      `import { JsonEditor, EditorCore, rocketActionIcon, linkActionIcon } from '${packageName}';`,
      '',
      'if (typeof JsonEditor !== "object" && typeof JsonEditor !== "function") {',
      '  throw new Error("JsonEditor export is missing.");',
      '}',
      'if (typeof EditorCore !== "function") {',
      '  throw new Error("EditorCore export is missing.");',
      '}',
      'if (typeof rocketActionIcon !== "string" || typeof linkActionIcon !== "string") {',
      '  throw new Error("Action icon helpers are missing.");',
      '}',
      `if (!import.meta.resolve('${styleSubpath}').endsWith('${styleDistSuffix}')) {`,
      '  throw new Error("Style subpath does not resolve to dist/style.css.");',
      '}'
    ].join('\n')
  );

  writeFileSync(
    join(tempDir, 'smoke.cjs'),
    [
      `const { JsonEditor, EditorCore, rocketActionIcon, linkActionIcon } = require('${packageName}');`,
      '',
      'if ((typeof JsonEditor !== "object" && typeof JsonEditor !== "function") || typeof EditorCore !== "function") {',
      '  throw new Error("CommonJS root entrypoint is missing public exports.");',
      '}',
      'if (typeof rocketActionIcon !== "string" || typeof linkActionIcon !== "string") {',
      '  throw new Error("CommonJS action icon helpers are missing.");',
      '}',
      `require.resolve('${styleSubpath}');`
    ].join('\n')
  );

  writeFileSync(
    join(tempDir, 'smoke.tsx'),
    [
      "import type * as React from 'react';",
      `import { JsonEditor, type EditorCore, type JsonEditorProps, type SchemaInfoConfig, type StatusBarConfig } from '${packageName}';`,
      `import '${styleSubpath}';`,
      '',
      'const statusBarConfig: StatusBarConfig = {',
      '  className: "json-status"',
      '};',
      '',
      'const schemaInfoConfig: SchemaInfoConfig = {',
      '  className: "json-schema-info"',
      '};',
      '',
      'const props: JsonEditorProps = {',
      '  defaultValue: "{}",',
      '  onValueChange: (value: string) => value.length,',
      '  statusBarConfig,',
      '  schemaInfoConfig',
      '};',
      '',
      'const editor: React.ForwardRefExoticComponent<JsonEditorProps & React.RefAttributes<EditorCore>> = JsonEditor;',
      'void props;',
      'void editor;'
    ].join('\n')
  );

  run('pnpm', ['install', '--silent', '--ignore-scripts']);
  run('node', ['smoke.mjs']);
  run('node', ['smoke.cjs']);
  run('pnpm', ['exec', 'tsc', '-p', 'tsconfig.json']);
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

if (errors.length > 0) {
  console.error(errors.join('\n\n'));
  process.exit(1);
}

console.log('Public entrypoint smoke check passed.');
