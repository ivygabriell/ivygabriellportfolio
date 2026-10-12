import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { read } from './dist';

describe('topo da home', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: hero, destaque e sobre com habilidades', (lang, t) => {
    const html = read(`${lang}/index.html`);
    expect(html).toContain(t.hero.title);
    expect(html).toContain('id="destaque"');
    expect(html).toContain('id="sobre"');
    for (const skill of t.about.skills) expect(html).toContain(skill);
    expect(html).toContain('data-reveal="words"');
  });

  it('a navbar tem links por âncora, pílula de contato e troca de idioma', () => {
    const html = read('pt/index.html');
    expect(html).toContain('href="#sobre"');
    expect(html).toContain('href="#servicos"');
    expect(html).toContain('href="#projetos"');
    expect(html).toContain('href="#contato"');
    expect(html).toMatch(/data-lang-switch[^>]*href="\/en\/"|href="\/en\/"[^>]*data-lang-switch/);
  });

  it('o painel de destaque não carrega vídeo nem modal enquanto não houver vídeo', () => {
    const html = read('pt/index.html');
    expect(html).not.toContain('<dialog');
  });
});
