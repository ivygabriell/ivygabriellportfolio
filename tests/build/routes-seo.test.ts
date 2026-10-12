import { describe, expect, it } from 'vitest';
import { exists, read } from './dist';

describe('rotas e SEO', () => {
  it('gera as duas homes com o lang correto', () => {
    expect(read('pt/index.html')).toContain('<html lang="pt-BR"');
    expect(read('en/index.html')).toContain('<html lang="en"');
  });

  it('cada home aponta para a outra com hreflang e tem x-default', () => {
    const pt = read('pt/index.html');
    expect(pt).toMatch(/<link rel="alternate" hreflang="en" href="[^"]*\/en\/"/);
    expect(pt).toMatch(/<link rel="alternate" hreflang="pt-BR" href="[^"]*\/pt\/"/);
    expect(pt).toMatch(/hreflang="x-default" href="[^"]*\/pt\/"/);
    expect(pt).toMatch(/<link rel="canonical" href="[^"]*\/pt\/"/);
  });

  it('tem Open Graph e Twitter card', () => {
    const pt = read('pt/index.html');
    expect(pt).toContain('property="og:title"');
    expect(pt).toContain('property="og:image"');
    expect(pt).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('a raiz redireciona por JavaScript e tem fallback sem JS', () => {
    const root = read('index.html');
    expect(root).toContain('<noscript>');
    expect(root).toMatch(/http-equiv="refresh" content="0;url=\/pt\/"/);
    expect(root).toContain('href="/en/"');
  });

  it('enquanto houver conteúdo de exemplo, as páginas levam noindex', () => {
    expect(read('pt/index.html')).toContain('name="robots" content="noindex"');
  });

  it('gera sitemap, favicon e imagem de compartilhamento', () => {
    expect(exists('sitemap-index.xml')).toBe(true);
    expect(exists('favicon.svg')).toBe(true);
    expect(exists('og-cover.png')).toBe(true);
  });
});
