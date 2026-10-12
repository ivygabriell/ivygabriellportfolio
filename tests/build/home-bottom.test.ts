import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { site } from '../../src/content/site';
import { read } from './dist';

describe('base da home', () => {
  it('o fechamento tem o botão de copiar e um link mailto como alternativa', () => {
    const html = read('pt/index.html');
    expect(html).toContain('id="contato"');
    expect(html).toContain(`data-clipboard-copy="${site.email}"`);
    expect(html).toContain(`href="mailto:${site.email}"`);
  });

  it('o footer tem o © com o país e as redes, e nenhum e-mail', () => {
    const html = read('pt/index.html');
    expect(html).toContain('<footer');
    expect(html).toContain(pt.footer.rights);
    expect(html).not.toContain('Localização');
    const footer = html.slice(html.indexOf('<footer'));
    expect(footer).not.toContain('mailto:');
    expect(footer).not.toContain('data-clipboard-copy');
    for (const s of site.socials) expect(html).toContain(s.url);
  });

  it.each([['pt', pt], ['en', en]] as const)('%s: o footer só tem as seções (sem EN/PT) e alinha com o Sobre', (lang, t) => {
    const html = read(`${lang}/index.html`);
    const footer = html.slice(html.indexOf('<footer'));
    expect(footer).not.toContain('data-lang-switch');
    for (const id of ['sobre', 'servicos', 'contato']) expect(footer).toContain(`href="#${id}"`);
    expect(footer).toContain(t.footer.rights);
    expect(footer).not.toMatch(/class="container[ "]/);
    expect(footer.match(/class="container--narrow/g)?.length).toBeGreaterThanOrEqual(3);
  });
});
