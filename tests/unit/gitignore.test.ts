import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Lê o texto do arquivo (não chama o git) para o teste também rodar em hospedagens sem a pasta .git.
const lines = readFileSync('.gitignore', 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

describe('.gitignore', () => {
  it.each([
    'node_modules',
    'dist',
    '.astro',
    '.DS_Store',
    '.superpowers',
    '.vercel',
    '.netlify',
    '*.log',
    'coverage',
    '*.tsbuildinfo',
    '.idea',
    '.claude/settings.local.json',
  ])('ignora %s', (entry) => {
    expect(lines).toContain(entry);
  });

  it('ignora qualquer .env, mas mantém o modelo .env.example versionado', () => {
    expect(lines).toContain('.env');
    expect(lines).toContain('.env.*');
    const example = lines.indexOf('!.env.example');
    expect(example).toBeGreaterThan(lines.indexOf('.env.*'));
  });

  it('não ignora nada que o projeto precisa versionar', () => {
    for (const needed of ['package-lock.json', 'public', 'src', 'tests', 'docs', 'scripts'])
      expect(lines, needed).not.toContain(needed);
  });
});
