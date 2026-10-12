import { describe, expect, it } from 'vitest';
import { media } from '../../src/content/media';
import { exists, read } from './dist';

describe.each(['pt', 'en'])('vídeos na página %s', (lang) => {
  const html = read(`${lang}/index.html`);

  it('o Destaque tem a capa como <picture> (4:5 no celular, 16:9 no desktop) e o vídeo por cima, carregado só depois', () => {
    const panel = html.slice(html.indexOf('id="destaque"'), html.indexOf('id="sobre"'));
    const picture = panel.match(/<picture\b[\s\S]*?<\/picture>/)?.[0] ?? '';
    expect(picture, '<picture> do Destaque').not.toBe('');
    expect(picture).toMatch(new RegExp(`<source[^>]*media="\\(max-width: 767px\\)"[^>]*srcset="${media.highlight.mobile.poster}"|<source[^>]*srcset="${media.highlight.mobile.poster}"[^>]*media="\\(max-width: 767px\\)"`));
    expect(picture).toContain(`src="${media.highlight.desktop.poster}"`);
    expect(picture).toContain('fetchpriority="high"');
    expect(picture).toMatch(/\balt=""/);
    const tag = panel.match(/<video\b[^>]*>/)?.[0] ?? '';
    expect(tag, 'tag <video> do Destaque').not.toBe('');
    for (const attr of ['muted', 'loop', 'playsinline', 'aria-hidden="true"']) expect(tag).toContain(attr);
    expect(tag).toContain(`data-src-desktop="${media.highlight.desktop.video}"`);
    expect(tag).toContain(`data-src-mobile="${media.highlight.mobile.video}"`);
    // O vídeo não começa a baixar com a página: o script define o src depois do load.
    expect(tag).not.toMatch(/\ssrc=/);
    expect(tag).not.toContain('autoplay');
    expect(tag).not.toContain('poster=');
    expect(panel).not.toContain('class="blob');
    expect(panel).not.toContain('class="statement');
  });

  it('cada cartão de Serviços tem o seu vídeo, na ordem, com capa e sem a arte em SVG', () => {
    const work = html.slice(html.indexOf('id="servicos"'), html.indexOf('</main>'));
    const tags = [...work.matchAll(/<video\b[^>]*>/g)].map((m) => m[0]);
    expect(tags).toHaveLength(media.services.length);
    tags.forEach((tag, i) => {
      expect(tag).toContain(`src="${media.services[i].video}"`);
      expect(tag).toContain(`poster="${media.services[i].poster}"`);
      for (const attr of ['muted', 'loop', 'playsinline', 'aria-hidden="true"']) expect(tag).toContain(attr);
      expect(tag).not.toContain('autoplay');
    });
    expect(work).not.toContain('<svg');
  });
});

describe('arquivos publicados', () => {
  it('todos os vídeos e capas vão para o dist', () => {
    for (const c of [media.highlight.desktop, media.highlight.mobile, ...media.services]) {
      expect(exists(c.video.slice(1)), c.video).toBe(true);
      expect(exists(c.poster.slice(1)), c.poster).toBe(true);
    }
  });
});
