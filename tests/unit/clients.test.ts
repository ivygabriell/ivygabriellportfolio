import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { testimonials } from '../../src/content/clients';
import { site } from '../../src/content/site';

describe('depoimentos (dados)', () => {
  it('são 5, como na seção "Trusted by our clients" do Cuberto', () => {
    expect(testimonials).toHaveLength(5);
  });

  it('cada cliente tem id único, nome e um logo SVG que existe em public/', () => {
    const ids = new Set<string>();
    for (const t of testimonials) {
      expect(t.name.trim().length, t.id).toBeGreaterThan(0);
      expect(ids.has(t.id), `id repetido: ${t.id}`).toBe(false);
      ids.add(t.id);
      expect(t.logo.startsWith('/media/clients/') && t.logo.endsWith('.svg'), t.logo).toBe(true);
      expect(existsSync(`public${t.logo}`), t.logo).toBe(true);
    }
  });

  it('o logo gerado mostra o mesmo nome que os dados (gerador e lista não podem divergir)', () => {
    for (const t of testimonials) expect(readFileSync(`public${t.logo}`, 'utf8'), t.id).toContain(`>${t.name}</text>`);
  });

  it('os logos de exemplo usam o azul-noite da paleta e não carregam nada externo', () => {
    for (const t of testimonials) {
      const svg = readFileSync(`public${t.logo}`, 'utf8');
      expect(svg.startsWith('<svg'), t.logo).toBe(true);
      expect(svg, t.logo).toContain('#0b1330');
      expect(svg, t.logo).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
      expect(svg, t.logo).not.toContain('<script');
    }
  });

  it('só existem os logos dos 5 clientes (nada sobrando do desenho antigo de 12 logos)', async () => {
    const { readdirSync } = await import('node:fs');
    expect(readdirSync('public/media/clients').sort()).toEqual(testimonials.map((t) => `${t.id}.svg`).sort());
  });

  it('TRAVA: com o site fora do modo de exemplo, nenhum depoimento fictício pode ficar publicado', () => {
    // Enquanto `site.example` for true (noindex), depoimentos de exemplo são aceitos.
    // Ao virar false, este teste falha até todos serem reais (`example: false`).
    if (site.example) return;
    for (const t of testimonials) expect(t.example, `${t.id} ainda é fictício`).toBe(false);
  });

  it('os depoimentos de exemplo estão marcados como tal', () => {
    expect(testimonials.some((t) => t.example)).toBe(true);
  });
});

describe('depoimentos (textos)', () => {
  it('o título da seção, em cada idioma', () => {
    expect(pt.clients.title).toBe('Quem confia no meu trabalho');
    expect(en.clients.title).toBe('Trusted by my clients');
  });

  it('o texto alternativo do logo tem o nome do cliente no lugar certo', () => {
    expect(pt.clients.logoAlt).toBe('Logo de {name}');
    expect(en.clients.logoAlt).toBe('{name} logo');
  });

  it('há um depoimento por cliente em cada idioma, com texto de tamanho parecido com o do Cuberto', () => {
    for (const t of [pt, en]) {
      expect(t.clients.items).toHaveLength(testimonials.length);
      for (const quote of t.clients.items) {
        expect(quote.length, quote).toBeGreaterThan(120);
        expect(quote.length, quote).toBeLessThan(320);
        expect(quote, 'aspas ficam por conta do CSS').not.toMatch(/^["“]|["”]$/);
      }
    }
  });
});
