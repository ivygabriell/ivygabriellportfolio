import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { read } from './dist';

function allCss(): string {
  const dir = 'dist/_astro';
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`${dir}/${f}`, 'utf8'));
  const inline = ['pt/index.html'].flatMap((page) =>
    [...read(page).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]),
  );
  return [...files, ...inline].join('\n');
}

describe('nomes acessíveis', () => {
  it('o link de e-mail do footer expõe o endereço visível (sem aria-label que o esconda)', () => {
    const html = read('pt/index.html');
    const pill = html.match(/<a[^>]*class="pill"[^>]*>[^<]*<\/a>/);
    expect(pill, 'pílula de e-mail do footer').not.toBeNull();
    expect(pill![0]).not.toContain('aria-label');
  });

  it('o link de idioma contém o texto visível no nome acessível e não troca o lang do nome', () => {
    for (const [page, visible] of [['pt/index.html', 'EN'], ['en/index.html', 'PT']] as const) {
      const links = [...read(page).matchAll(/<a[^>]*data-lang-switch[^>]*>/g)].map((m) => m[0]);
      expect(links.length).toBeGreaterThan(0);
      for (const tag of links) {
        expect(tag).toMatch(new RegExp(`aria-label="${visible}\\b`));
        expect(tag).not.toMatch(/\slang="/);
      }
    }
  });
});

describe('cartões de serviços', () => {
  it('a grade não estica as linhas quando reservamos altura', () => {
    const rule = allCss().match(/\.items\b[^{}]*\{[^}]*\}/g)?.find((r) => r.includes('display:grid')) ?? '';
    expect(rule).toContain('align-content:start');
  });

  it('o título fica dentro do h3 e o botão do acordeão é um elemento interno, com ids para aria-controls', () => {
    const html = read('pt/index.html');
    expect(html).toMatch(/<h3[^>]*class="item__title"[^>]*><span[^>]*class="item__toggle"/);
    expect(html).toMatch(/<div[^>]*class="item__accordion"[^>]*id="service-0"|<div[^>]*id="service-0"[^>]*class="item__accordion"/);
  });

  it('conteúdo recolhido fica fora da ordem de tabulação (visibility hidden)', () => {
    const css = allCss();
    expect(css).toMatch(/is-accordion[^{}]*item__inner[^{}]*\{[^}]*visibility:hidden/);
    expect(css).toMatch(/is-scrub[^{}]*item__inner[^{}]*\{[^}]*visibility:hidden/);
  });
});
