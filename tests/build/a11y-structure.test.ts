import { describe, expect, it } from 'vitest';
import { read } from './dist';

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
