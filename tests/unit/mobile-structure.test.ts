import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Estrutura mobile medida no Cuberto a 390px (docs/mobile/AUDITORIA.md, issue #5).
const src = (path: string) => readFileSync(`src/${path}`, 'utf8');
const MOBILE = '(max-width: 767px)';

// Junta o conteúdo de todos os blocos `@media <query> { ... }` do arquivo (com chaves aninhadas).
function media(text: string, query: string): string {
  const parts: string[] = [];
  const head = `@media ${query}`;
  for (let i = text.indexOf(head); i !== -1; i = text.indexOf(head, i)) {
    const open = text.indexOf('{', i);
    let depth = 1;
    let k = open + 1;
    for (; depth > 0 && k < text.length; k++) {
      if (text[k] === '{') depth++;
      else if (text[k] === '}') depth--;
    }
    parts.push(text.slice(open + 1, k - 1));
    i = k;
  }
  return parts.join('\n');
}
const mobile = (path: string) => media(src(path), MOBILE);

// Declarações das regras cujo seletor é exatamente `selector` (todas as ocorrências, em ordem).
function rule(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\:]/g, '\\$&');
  const re = new RegExp(`(?:^|[;{}\\s])${escaped}\\s*\\{([^{}]*)\\}`, 'g');
  const found = [...css.matchAll(re)].map((m) => m[1]);
  if (!found.length) throw new Error(`regra não encontrada: ${selector}`);
  return found.join('\n');
}

describe('mobile: margem lateral', () => {
  it('as margens laterais (--gutter e --narrow) são 1.5rem, como no Cuberto', () => {
    const root = rule(mobile('styles/tokens.css'), ':root');
    expect(root).toMatch(/--gutter:\s*1\.5rem/);
    expect(root).toMatch(/--narrow:\s*1\.5rem/);
  });
});

describe('mobile: Hero, Destaque e Sobre', () => {
  it('o Hero tem 12rem acima do título (a barra fixa ocupa 1rem + 4.8rem)', () => {
    expect(rule(mobile('components/Hero.astro'), '.Hero')).toMatch(/padding-top:\s*12rem/);
  });

  it('o subtítulo do Hero tem entrelinha 1.3 e 3.2rem de espaço acima', () => {
    const p = rule(mobile('components/Hero.astro'), 'p');
    expect(p).toMatch(/line-height:\s*1\.3/);
    expect(p).toMatch(/margin-top:\s*3\.2rem/);
  });

  it('o painel do Destaque usa a proporção 355/400', () => {
    expect(rule(mobile('components/Panel.astro'), '.main')).toMatch(/aspect-ratio:\s*355\s*\/\s*400/);
  });

  it('o parágrafo do Sobre tem 2rem com entrelinha 1.3', () => {
    const lead = rule(mobile('components/About.astro'), '.lead');
    expect(lead).toMatch(/font-size:\s*2rem/);
    expect(lead).toMatch(/line-height:\s*1\.3/);
  });
});
