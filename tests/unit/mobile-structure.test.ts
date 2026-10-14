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
const mobile = (path: string) => {
  const css = media(src(path), MOBILE);
  // Sem isto, um bloco @media renomeado faria os testes negativos passarem sem testar nada.
  if (!css.trim()) throw new Error(`${path}: bloco ${MOBILE} não encontrado`);
  return css;
};

// Declarações das regras cujo seletor é exatamente `selector` (todas as ocorrências, em ordem).
function rule(css: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\:]/g, '\\$&');
  // O seletor começa a regra (logo depois de `{`, `}`, `;` ou de um comentário): `.menu` não casa com `html .menu`.
  const re = new RegExp(`(?:^|[;{}/])\\s*${escaped}\\s*\\{([^{}]*)\\}`, 'g');
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
      for (; depth > 0 && k < rest.length; k++) {
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

describe('mobile: barra de vidro fixa', () => {
  const css = () => mobile('components/Navbar.astro');

  it('a barra é fixa desde o topo, a 1rem do topo e dos lados, com uma linha de 4.8rem', () => {
    const bar = rule(css(), '.bar');
    expect(bar).toMatch(/position:\s*fixed/);
    expect(bar).toMatch(/top:\s*1rem/);
    expect(bar).toMatch(/left:\s*1rem/);
    expect(bar).toMatch(/right:\s*1rem/);
    expect(bar).toMatch(/grid-template-rows:\s*4\.8rem auto/);
  });

  it('o vidro (::before) é o fundo claro a 70%, com blur de 8px, borda de 1px e raio de 2.5rem', () => {
    const glass = rule(css(), '.bar::before');
    expect(glass).toMatch(/content:\s*''/);
    expect(glass).toMatch(/position:\s*absolute/);
    expect(glass).toMatch(/background:\s*rgb\(247 248 252 \/ 0\.7\)/);
    expect(glass).toMatch(/backdrop-filter:\s*blur\(8px\)/);
    expect(glass).toMatch(/border:\s*1px solid/);
    expect(glass).toMatch(/border-radius:\s*2\.5rem/);
  });

  it('ao rolar a barra não some no mobile: o estado fixo não desloca o header', () => {
    const fixed = rule(css(), '.Navbar:global(.-fixed)');
    expect(fixed).toMatch(/transform:\s*none/);
    expect(fixed).toMatch(/position:\s*absolute/);
  });

  it('o vidro também desfoca no Safari do iOS (prefixo -webkit-)', () => {
    expect(rule(css(), '.bar::before')).toMatch(/-webkit-backdrop-filter:\s*blur\(8px\)/);
    expect(rule(css(), '.Navbar:global(.-open) .bar::before')).toMatch(/-webkit-backdrop-filter:\s*blur\(15px\)/);
  });

  it('as âncoras param abaixo da barra fixa (1rem + 4.8rem + folga)', () => {
    expect(rule(media(src('styles/global.css'), MOBILE), 'html')).toMatch(/scroll-padding-top:\s*7rem/);
  });

  it('ao rolar a barra encolhe para 6.2rem de cada lado em 0.8s, e volta à largura cheia com o menu aberto', () => {
    expect(rule(css(), '.Navbar:global(.-fixed:not(.-open)) .bar')).toMatch(/left:\s*6\.2rem;\s*right:\s*6\.2rem/);
    expect(rule(css(), '.bar')).toMatch(/transition:[^;]*left 0\.8s var\(--ease-out\)[^;]*right 0\.8s var\(--ease-out\)/);
  });

  it('logo de 2.6rem e botão do menu de 2.6rem com traços a 0.6rem', () => {
    expect(rule(css(), '.logo')).toMatch(/font-size:\s*2\.6rem/);
    const toggle = rule(css(), '.toggle');
    expect(toggle).toMatch(/width:\s*2\.6rem/);
    expect(toggle).toMatch(/height:\s*2\.6rem/);
    expect(toggle).toMatch(/gap:\s*calc\(0\.6rem - 2px\)/);
    expect(rule(css(), '.Navbar:global(.-open) .toggle span:first-child')).toMatch(/translateY\(0\.3rem\) rotate\(45deg\)/);
    expect(rule(css(), '.Navbar:global(.-open) .toggle span:last-child')).toMatch(/translateY\(-0\.3rem\) rotate\(-45deg\)/);
  });
});

describe('mobile: menu em gaveta dentro da barra', () => {
  const css = () => mobile('components/Navbar.astro');

  it('o conteúdo do menu fica num invólucro (a gaveta anima a altura dele)', () => {
    expect(src('components/Navbar.astro')).toMatch(/<nav id="menu" class="menu"[^>]*>\s*<div class="menu__inner">/);
  });

  it('não é mais tela cheia', () => {
    const menu = rule(css(), '.menu');
    expect(menu).not.toMatch(/position:\s*fixed/);
    expect(menu).not.toMatch(/inset:\s*0/);
    expect(menu).toMatch(/grid-column:\s*1\s*\/\s*-1/);
  });

  it('fechada: altura 0 (0fr), invisível e fora do Tab', () => {
    const menu = rule(css(), '.menu');
    expect(menu).toMatch(/grid-template-rows:\s*0fr/);
    expect(menu).toMatch(/opacity:\s*0/);
    expect(menu).toMatch(/visibility:\s*hidden/);
  });

  it('ao fechar, a gaveta continua visível durante a animação (visibility só muda depois de 0.5s)', () => {
    expect(rule(css(), '.menu')).toMatch(/transition:[^;]*visibility 0s 0\.5s/);
    expect(rule(css(), '.Navbar:global(.-open) .menu')).toMatch(/transition-delay:\s*0s/);
  });

  it('o contorno de foco dos links não é cortado: só o invólucro corta, a gaveta não', () => {
    // Revisão: com overflow: hidden no .menu o contorno de "Sobre", "Serviços" e "EN" perdia o lado esquerdo.
    expect(rule(css(), '.menu')).not.toMatch(/overflow:\s*hidden/);
  });

  it('abre a altura em 0.5s cubic-bezier(.2,0,0,1) e a opacidade em 0.4s, como no Cuberto', () => {
    const menu = rule(css(), '.menu');
    expect(menu).toMatch(/transition:[^;]*grid-template-rows 0\.5s cubic-bezier\(0\.2, 0, 0, 1\)/);
    expect(menu).toMatch(/transition:[^;]*opacity 0\.4s/);
  });

  it('aberta: 1fr, visível, e o vidro fica com raio de 1.6rem', () => {
    const open = rule(css(), '.Navbar:global(.-open) .menu');
    expect(open).toMatch(/grid-template-rows:\s*1fr/);
    expect(open).toMatch(/opacity:\s*1/);
    expect(open).toMatch(/visibility:\s*visible/);
    expect(rule(css(), '.Navbar:global(.-open) .bar::before')).toMatch(/border-radius:\s*1\.6rem/);
  });

  it('links a 3.6rem e uma linha de 1px no topo da gaveta (sem rótulo "Menu", decisão P3)', () => {
    const navs = rule(css(), '.navs');
    expect(navs).toMatch(/font-size:\s*3\.6rem/);
    expect(navs).toMatch(/border-top:\s*1px solid var\(--c-line\)/);
  });

  it('fechada, a gaveta chega a 0 de altura: o invólucro não tem respiro vertical nem borda e corta o conteúdo', () => {
    // Medido no navegador: com padding e borda no invólucro, a gaveta fechada ficava com 51px.
    const inner = rule(css(), '.menu__inner');
    expect(inner).toMatch(/min-height:\s*0/);
    expect(inner).toMatch(/overflow:\s*hidden/);
    expect(inner).not.toMatch(/padding(-block|-top|-bottom)?:\s*[1-9]/);
    expect(inner).not.toMatch(/border/);
  });

  it('com movimento reduzido a barra, o vidro e a gaveta não têm transição', () => {
    const reduced = media(src('components/Navbar.astro'), '(prefers-reduced-motion: reduce)');
    const [selectors, body] = reduced.split('{');
    expect(body).toMatch(/transition:\s*none/);
    const list = selectors.split(',').map((x) => x.trim());
    for (const selector of ['.bar', '.bar::before', '.menu', '.toggle span']) expect(list).toContain(selector);
  });

  it('sem JavaScript a gaveta fica aberta e navegável', () => {
    const noJs = rule(css(), ':global(html:not(.js)) .menu');
    expect(noJs).toMatch(/visibility:\s*visible/);
    expect(noJs).toMatch(/opacity:\s*1/);
    expect(rule(css(), ':global(html:not(.js)) .bar')).toMatch(/position:\s*relative/);
    // O header também volta ao fluxo, senão a barra cobre o título do Hero.
    expect(rule(css(), ':global(html:not(.js)) .Navbar')).toMatch(/position:\s*relative/);
  });

  it('a página não trava a rolagem com o menu aberto (decisão P4)', () => {
    expect(src('styles/global.css')).not.toMatch(/\.menu-open\s*\{[^}]*overflow:\s*hidden/);
  });
});
