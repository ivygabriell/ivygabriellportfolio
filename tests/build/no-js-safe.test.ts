import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { read } from './dist';

// O Astro embute CSS pequeno em <style> no HTML e separa o resto em _astro/*.css: lemos as duas fontes.
function allCss(): string {
  const dir = 'dist/_astro';
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`${dir}/${f}`, 'utf8'));
  const inline = ['pt/index.html', 'en/index.html'].flatMap((page) =>
    [...read(page).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]),
  );
  return [...files, ...inline].join('\n');
}

describe('conteúdo visível sem JavaScript ou com movimento reduzido', () => {
  it('nenhum elemento sai do servidor escondido por estilo inline', () => {
    for (const page of ['pt/index.html', 'en/index.html']) {
      expect(read(page)).not.toMatch(/style="[^"]*(opacity:\s*0|visibility:\s*hidden)/);
    }
  });

  it('toda regra que esconde [data-reveal] só vale sob .motion', () => {
    const rules = allCss().match(/[^{}]*\[data-reveal[^{}]*\{[^}]*\}/g) ?? [];
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) expect(rule).toContain('.motion');
  });

  it('há um timeout de segurança que mostra tudo se o script não subir', () => {
    expect(allCss()).toContain('.motion-failed');
    expect(read('pt/index.html')).toContain('motion-failed');
  });

  it('a classe .motion só é adicionada fora do modo de movimento reduzido', () => {
    const html = read('pt/index.html');
    const bootstrap = html.slice(html.indexOf('prefers-reduced-motion: reduce'));
    expect(html).toContain("classList.add('js')");
    expect(bootstrap.indexOf("classList.add('motion')")).toBeGreaterThan(-1);
    expect(html).toMatch(/if\s*\(\s*!\s*reduced\s*\)/);
  });
});
