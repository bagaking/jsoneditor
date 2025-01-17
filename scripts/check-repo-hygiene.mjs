import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';

const errors = [];

const trackedFiles = execFileSync('git', ['ls-files', '-z'], {
  encoding: 'utf8'
}).split('\0').filter(Boolean);

const slash = String.fromCharCode(47);
const forbiddenTrackedFiles = [
  { pattern: new RegExp(`(^|${slash})[.]DS_Store$`), reason: 'OS metadata must not be tracked' },
  { pattern: new RegExp(`^node_modules${slash}`), reason: 'dependencies must not be tracked' },
  { pattern: new RegExp(`^dist${slash}`), reason: 'library build output must not be tracked' },
  { pattern: new RegExp(`^demo${slash}dist${slash}`), reason: 'demo build output must not be tracked' },
  { pattern: new RegExp('[.]tgz$'), reason: 'packed npm archives must not be tracked' }
];

for (const file of trackedFiles) {
  for (const rule of forbiddenTrackedFiles) {
    if (rule.pattern.test(file)) {
      errors.push(`${file}: ${rule.reason}.`);
    }
  }
}

const textFilePattern = new RegExp(
  String.raw`(?:^|[.])(?:cjs|css|html|js|json|md|mjs|puml|ts|tsx|txt|yaml|yml)$`
);
const credentialNameSegments = [
  'api[_-]?key',
  `pass${'word'}`,
  `sec${'ret'}`,
  `tok${'en'}`,
  'auth[_-]?tok' + 'en',
  'npm[_-]?tok' + 'en'
].join('|');
const credentialNamePattern = String.raw`(?:^|[A-Z0-9]+[_-])(?:${credentialNameSegments})(?:[_-][A-Z0-9]+)*`;
const credentialAssignmentPattern = new RegExp(
  String.raw`\b${credentialNamePattern}\b\s*[:=]\s*(?:"[^"']{8,}"|'[^"']{8,}'|[^\s#'"]{8,})`,
  'i'
);
const npmAuthTokenPrefixChars = `${slash}@.\\w-`;
const npmAuthTokenPattern = new RegExp(
  `(?:^|[${npmAuthTokenPrefixChars}]+:)_authTok${'en'}\\s*=\\s*[^\\s#]+`,
  'i'
);
const absolutePathPatterns = [
  { pattern: new RegExp(`${slash}${'Users'}${slash}[^${slash}\\s'")]+`, 'g'), reason: 'local macOS home path' },
  { pattern: new RegExp(`${slash}home${slash}[^${slash}\\s'")]+`, 'g'), reason: 'local Linux home path' }
];

for (const file of trackedFiles) {
  if (!textFilePattern.test(file) || !existsSync(file) || statSync(file).size > 1024 * 1024) {
    continue;
  }

  const content = readFileSync(file, 'utf8');
  const lines = content.split(new RegExp('\\r?\\n'));

  lines.forEach((line, index) => {
    for (const rule of absolutePathPatterns) {
      if (rule.pattern.test(line)) {
        errors.push(`${file}:${index + 1}: contains ${rule.reason}.`);
      }
      rule.pattern.lastIndex = 0;
    }

    if (credentialAssignmentPattern.test(line)) {
      errors.push(`${file}:${index + 1}: contains a high-risk credential-like assignment.`);
    }
    if (npmAuthTokenPattern.test(line)) {
      errors.push(`${file}:${index + 1}: contains an npm auth token assignment.`);
    }
  });
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('Repository hygiene check passed.');
