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

describe('mobile: Serviços', () => {
  const css = () => mobile('components/Work.astro');

  it('o título tem 4.5rem', () => {
    expect(rule(css(), 'h2')).toMatch(/font-size:\s*4\.5rem/);
  });

  it('a linha do título some abaixo de 768px (decisão P2) e o 1º cartão fica a 4rem do título', () => {
    expect(rule(css(), '.rule')).toMatch(/display:\s*none/);
    expect(rule(css(), '.head')).toMatch(/padding-bottom:\s*4rem/);
  });

  it('a mídia do cartão usa a proporção 365/420', () => {
    expect(rule(css(), '.Card__media')).toMatch(/aspect-ratio:\s*365\s*\/\s*420/);
  });
});

describe('mobile: Contato e footer', () => {
  it('o Contato continua centralizado no mobile (decisão P5)', () => {
    const css = mobile('components/Outro.astro');
    expect(css).not.toMatch(/text-align:\s*left/);
    expect(css).not.toMatch(/justify-items:\s*start/);
    expect(css).not.toMatch(/justify-content:\s*flex-start/);
  });

  it('o título do Contato tem entrelinha 1.1 e o texto 1.3', () => {
    const css = mobile('components/Outro.astro');
    expect(rule(css, 'h2')).toMatch(/line-height:\s*1\.1/);
    expect(rule(css, 'p')).toMatch(/line-height:\s*1\.3/);
  });

  it('os botões do Contato têm 5.8rem de altura', () => {
    expect(rule(mobile('components/Outro.astro'), '.actions')).toMatch(/--pill-h:\s*5\.8rem/);
  });

  it('os botões do Contato entram com fade-up, como o botão do Cuberto', () => {
    expect(src('components/Outro.astro')).toMatch(/<div class="actions" data-reveal="fade-up">/);
  });

  it('os links do footer ficam em 2 colunas de 2rem, com 1rem de respiro vertical', () => {
    const css = mobile('components/Footer.astro');
    const links = rule(css, '.links');
    expect(links).toMatch(/grid-template-columns:\s*1fr 1fr/);
    expect(links).toMatch(/font-size:\s*2rem/);
    expect(rule(css, '.links a')).toMatch(/padding:\s*1rem 0/);
  });

  it('as redes do footer se distribuem na largura e o © tem 1.4rem', () => {
    const css = mobile('components/Footer.astro');
    expect(rule(css, '.socials')).toMatch(/justify-content:\s*space-between/);
    expect(rule(css, '.rights')).toMatch(/font-size:\s*1\.4rem/);
  });
});

describe('toque: hover só com mouse', () => {
  // Fora de `@media (pointer: fine)` o hover "gruda" depois do toque (o Cuberto filtra todos os hovers assim).
  const outsideFine = (text: string) => {
    const head = '@media (pointer: fine)';
    let rest = text;
    for (let i = rest.indexOf(head); i !== -1; i = rest.indexOf(head)) {
      const open = rest.indexOf('{', i);
      let depth = 1;
      let k = open + 1;
      for (; depth > 0; k++) {
        if (rest[k] === '{') depth++;
        else if (rest[k] === '}') depth--;
      }
      rest = rest.slice(0, i) + rest.slice(k);
    }
    return rest;
  };

  it.each(['components/Pill.astro', 'components/Footer.astro', 'components/Navbar.astro'])(
    '%s: todo :hover fica dentro de @media (pointer: fine)',
    (file) => {
      const text = src(file);
      expect(text).toContain(':hover');
      expect(outsideFine(text)).not.toContain(':hover');
    },
  );

  it('o foco por teclado continua mostrando o preenchimento do botão fora do filtro de mouse', () => {
    const outside = outsideFine(src('components/Pill.astro'));
    expect(rule(outside, '.Pill:focus-visible::before')).toMatch(/transform:\s*translateY\(0\)/);
  });
});
