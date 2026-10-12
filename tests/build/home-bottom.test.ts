import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { site } from '../../src/content/site';
import { loadProjects } from '../../src/lib/projects';
import { read } from './dist';

describe('base da home', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: serviços vêm antes de projetos', (lang, t) => {
    const html = read(`${lang}/index.html`);
    const servicos = html.indexOf('id="servicos"');
    const projetos = html.indexOf('id="projetos"');
    expect(servicos).toBeGreaterThan(-1);
    expect(projetos).toBeGreaterThan(servicos);
    for (const item of t.services.items) expect(html).toContain(item.title);
  });

  it.skipIf(loadProjects().length === 0)('lista todos os projetos, cada um apontando para a página do idioma', () => {
    const projects = loadProjects();
    const pt = read('pt/index.html');
    const en = read('en/index.html');
    for (const p of projects) {
      expect(pt).toContain(`href="/pt/projetos/${p.slug}/"`);
      expect(en).toContain(`href="/en/projects/${p.slug}/"`);
      expect(pt).toContain(p.pt.caption);
    }
  });

  it('o fechamento tem o botão de copiar e um link mailto como alternativa', () => {
    const html = read('pt/index.html');
    expect(html).toContain('id="contato"');
    expect(html).toContain(`data-clipboard-copy="${site.email}"`);
    expect(html).toContain(`href="mailto:${site.email}"`);
  });

  it('o footer tem e-mail, localização e redes', () => {
    const html = read('pt/index.html');
    expect(html).toContain('<footer');
    expect(html).toContain(pt.footer.location);
    for (const s of site.socials) expect(html).toContain(s.url);
  });
});
