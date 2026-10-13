import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { read } from './dist';

// O Astro embute CSS pequeno em <style> e separa o resto em _astro/*.css: lemos as duas fontes.
function allCss(): string {
  const files = readdirSync('dist/_astro')
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`dist/_astro/${f}`, 'utf8'));
  const inline = [...read('pt/index.html').matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  return [...files, ...inline].join('\n');
}

describe('marcação das animações novas', () => {
  it.each(['pt', 'en'])('%s: quatro Dividers decorativos (2 no Sobre, 1 em Serviços, 1 no footer)', (lang) => {
    const html = read(`${lang}/index.html`);
    const dividers = html.match(/<div class="Divider[^"]*"[^>]*>/g) ?? [];
    expect(dividers).toHaveLength(4);
    for (const tag of dividers) expect(tag).toContain('aria-hidden="true"');
    const about = html.slice(html.indexOf('id="sobre"'), html.indexOf('id="servicos"'));
    expect(about.match(/class="Divider/g)).toHaveLength(2);
    const servicos = html.slice(html.indexOf('id="servicos"'), html.indexOf('</main>'));
    expect(servicos.match(/class="Divider/g)).toHaveLength(1);
    const footer = html.slice(html.indexOf('<footer'));
    expect(footer.match(/class="Divider/g)).toHaveLength(1);
  });

  it.each(['pt', 'en'])('%s: a linha sob o título de Serviços é um Divider (reage ao cursor), não uma linha parada', (lang) => {
    const html = read(`${lang}/index.html`);
    const head = html.slice(html.indexOf('id="servicos"'), html.indexOf('class="cards'));
    expect(head).toMatch(/<h2[^>]*data-reveal="words"/);
    expect(head).toContain('class="Divider');
    expect(head).not.toContain('Rule');
    expect(head).not.toContain('data-reveal="border"');
  });

  it('sem JavaScript o Divider continua sendo uma linha visível (fundo currentColor, sem esconder)', () => {
    const css = allCss();
    expect(css).toMatch(/\.Divider[^{}]*\{[^}]*background:\s*currentColor/);
    expect(css).not.toMatch(/\.Divider[^{}]*\{[^}]*opacity:\s*0/);
  });
});
