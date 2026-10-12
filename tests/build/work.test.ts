import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { readDecoded } from './dist';

function section(html: string): string {
  const start = html.indexOf('id="servicos"');
  return html.slice(start, html.indexOf('id="contato"'));
}

describe('seção Selected work (serviços)', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: título, 4 cartões com título e descrição, sem links', (lang, t) => {
    const html = readDecoded(`${lang}/index.html`);
    const work = section(html);
    expect(work).toMatch(/<h2[^>]*>Selected work<\/h2>/);
    const titles = [...work.matchAll(/<h3[^>]*class="Card__title[^"]*"[^>]*>([^<]*)<\/h3>/g)].map((m) => m[1]);
    expect(titles).toEqual(t.services.items.map((i) => i.title));
    for (const item of t.services.items) expect(work).toContain(item.text);
    expect(work).not.toContain('<a ');
  });

  it.each(['pt', 'en'])('%s: não restam a seção antiga de Serviços nem a de Projetos', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    expect(html).not.toContain('id="projetos"');
    expect(html).not.toContain('href="#projetos"');
    expect(html).not.toContain('item__accordion');
    expect(html).not.toContain('class="Services');
  });

  it.each(['pt', 'en'])('%s: a navbar e o footer levam à seção por #servicos', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    expect(html.match(/href="#servicos"/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
