import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { testimonials } from '../../src/content/clients';
import { readDecoded } from './dist';

describe.each([['pt', pt], ['en', en]] as const)('seção de depoimentos (%s)', (lang, t) => {
  const html = readDecoded(`${lang}/index.html`);
  const start = html.indexOf('id="clientes"');
  const section = html.slice(start, html.indexOf('id="servicos"'));

  it('fica entre o Sobre e os Serviços e se chama pelo título', () => {
    expect(start).toBeGreaterThan(html.indexOf('id="sobre"'));
    expect(html.indexOf('id="servicos"')).toBeGreaterThan(start);
    expect(html.slice(start - 120, start + 80)).toContain('aria-labelledby="clientes-title"');
  });

  it('tem o painel de fundo (.fill) e o título (h2) centralizado com a revelação por palavras', () => {
    expect(section).toContain('class="fill');
    expect(section).toMatch(new RegExp(`<h2[^>]*id="clientes-title"[^>]*data-reveal="words"[^>]*>${t.clients.title}</h2>|<h2[^>]*data-reveal="words"[^>]*id="clientes-title"[^>]*>${t.clients.title}</h2>`));
  });

  it('tem 5 cartões, cada um com aspas, texto, divisória e o logo com texto alternativo', () => {
    const cards = [...section.matchAll(/<li\b[^>]*class="[^"]*\btestimonial\b[^"]*"[^>]*>[\s\S]*?<\/li>/g)].map((m) => m[0]);
    expect(cards).toHaveLength(5);
    cards.forEach((card, i) => {
      expect(card, `cartão ${i}`).toContain('testimonial__quotes');
      expect(card).toContain('testimonial__divider');
      expect(card).toMatch(/<blockquote[^>]*class="[^"]*testimonial__text/);
      expect(card).toContain(t.clients.items[i]);
      const img = card.match(/<img\b[^>]*>/)?.[0] ?? '';
      expect(img).toContain(`src="${testimonials[i].logo}"`);
      expect(img).toContain(`alt="${t.clients.logoAlt.replace('{name}', testimonials[i].name)}"`);
      expect(img).toContain('loading="lazy"');
      expect(img).toMatch(/\bwidth="\d+"/);
      expect(img).toMatch(/\bheight="\d+"/);
    });
  });

  it('nenhum cartão é link nem abre o cursor com seta', () => {
    expect(section).not.toContain('<a ');
    expect(section).not.toContain('data-cursor-icon');
  });
});

describe('seção de depoimentos (CSS publicado)', () => {
  const files = readdirSync('dist/_astro').filter((f) => f.endsWith('.css')).map((f) => readFileSync(`dist/_astro/${f}`, 'utf8'));
  const inline = [...readDecoded('pt/index.html').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const css = [...files, ...inline].join('\n').replace(/\s+/g, ' ');

  it('o leque do desktop: giros de -9°, 9°, -20° e 20° nos cartões 1, 3, 4 e 5', () => {
    for (const deg of ['rotate(-9deg)', 'rotate(9deg)', 'rotate(-20deg)', 'rotate(20deg)']) expect(css, deg).toContain(deg);
  });

  it('cartões de 40rem com borda de 4px e transição de 1s na curva do Cuberto', () => {
    expect(css).toContain('40rem');
    expect(css).toMatch(/border:\s*4px solid/);
    expect(css).toMatch(/transition:\s*transform 1s cubic-bezier\(\.25,\s*1,\s*\.5,\s*1\)/);
  });

  it('ao passar o mouse nos cartões o leque se desfaz', () => {
    expect(css).toMatch(/:hover[^{]*\.testimonial[^{]*\{[^}]*translateY\(0\)[^}]*translate\(0\)[^}]*rotate\(0\)/);
  });

  it('com movimento reduzido o leque não anima', () => {
    expect(css).toMatch(/prefers-reduced-motion: ?reduce\)[^{]*\{[^}]*\.testimonial[^{]*\{[^}]*transition: ?none/);
  });
});
