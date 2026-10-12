import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { read } from './dist';

describe('topo da home', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: hero, destaque e sobre (sem habilidades)', (lang, t) => {
    const html = read(`${lang}/index.html`);
    expect(html).toContain(t.hero.title);
    expect(html).toContain(t.hero.subtitle);
    expect(html).toContain('id="destaque"');
    expect(html).toContain('id="sobre"');
    expect(html).not.toMatch(/class="[^"]*\bskills\b/);
    expect(html).not.toMatch(/class="[^"]*\bSkill\b/);
    expect(html).toContain('data-reveal="words"');
  });

  it('o logo do cabeçalho mostra IG, uma letra por elemento', () => {
    const html = read('pt/index.html');
    const logo = html.match(/<a class="logo"[^>]*>([\s\S]*?)<\/a>/);
    expect(logo, 'link do logo').not.toBeNull();
    const letters = [...logo![1].matchAll(/class="logo__ch[^"]*"[^>]*>([^<]*)</g)].map((m) => m[1]);
    expect(letters).toEqual(['I', 'G']);
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
