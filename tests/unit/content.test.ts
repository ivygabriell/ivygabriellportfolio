import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { loadProjects } from '../../src/lib/projects';

function leaves(value: unknown, prefix = ''): [string, unknown][] {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  return [[prefix, value]];
}

describe('textos', () => {
  it('pt.json e en.json têm exatamente as mesmas chaves', () => {
    expect(leaves(pt).map(([k]) => k)).toEqual(leaves(en).map(([k]) => k));
  });

  it('nenhum texto está vazio', () => {
    for (const [lang, json] of [['pt', pt], ['en', en]] as const)
      for (const [key, value] of leaves(json))
        expect(typeof value === 'string' && value.trim().length > 0, `${lang}:${key}`).toBe(true);
  });
});

describe('projetos reais', () => {
  const projects = loadProjects();

  it('há de 3 a 4 projetos válidos', () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(projects.length).toBeLessThanOrEqual(4);
  });

  it('toda mídia referenciada existe em public/', () => {
    for (const p of projects)
      for (const file of [p.cover, ...p.shots])
        expect(existsSync(`public${file}`), `${p.slug}: ${file}`).toBe(true);
  });
});
