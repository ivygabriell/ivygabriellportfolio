import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { loadProjects } from '../../src/lib/projects';
import { exists, readDecoded } from './dist';

describe.skipIf(loadProjects().length > 0)('sem projetos reais', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: mostra os cartões "Em breve" sem links de projeto', (lang, t) => {
    const html = readDecoded(`${lang}/index.html`);
    const section = html.slice(html.indexOf('id="projetos"'), html.indexOf('id="contato"'));
    expect(section.length).toBeGreaterThan(0);
    for (const text of t.projects.soon) expect(section).toContain(text);
    expect(section).not.toMatch(/href="\/(pt|en)\/(projetos|projects)\//);
  });

  it('nenhuma página de projeto é gerada', () => {
    expect(exists('pt/projetos')).toBe(false);
    expect(exists('en/projects')).toBe(false);
  });
});
