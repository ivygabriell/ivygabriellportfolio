# Portfólio: conteúdo real, contatos e paleta cobalto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o conteúdo de exemplo do portfólio pelo conteúdo real de Ivy Gabriel (textos PT/EN, contatos, projetos "Em breve") e aplicar a paleta cobalto, sem alterar estrutura nem animações.

**Architecture:** O site continua Astro estático. A paleta vive nos tokens CSS e nos poucos literais de cor dos componentes; o conteúdo vive em `src/content/*.json` e `site.ts`. Testes novos "congelam" os scripts de movimento e a ordem das seções, para provar que só as cores e os textos mudaram.

**Tech Stack:** Astro 7, GSAP, Lenis, TypeScript 6, Vitest 5, sharp (só para gerar/validar a imagem de compartilhamento).

**Spec:** `docs/superpowers/specs/2026-10-12-portfolio-conteudo-real-design.md` (complementa `2026-10-12-portfolio-design.md`).

## Global Constraints

- **Só as cores mudam.** Nenhum arquivo em `src/scripts/` muda, exceto o literal `backgroundColor: '#000'` em `services.ts`, que vira `'#0b1330'`. Ordem das seções: Hero → Destaque (`#destaque`) → Sobre (`#sobre`) → Serviços (`#servicos`) → Projetos (`#projetos`) → Contato (`#contato`).
- Paleta: `--c-bg #f7f8fc`, `--c-ink #0b1330`, `--c-mint #e4eaff`, `--c-lavender #d3dcff`, `--c-accent #1f4fff`. Contraste mínimo 4,5:1 nos pares de texto.
- Título e subtítulo do hero: PT `Ivy Gabriel, Desenvolvedor Full Stack.` / `Eu transformo a sua ideia em um produto digital além do convencional.`; EN `Ivy Gabriel, Full Stack Developer.` / `I turn your idea into a digital product beyond the conventional.`
- Contatos: e-mail `ivy.gabriel@icloud.com`; LinkedIn `https://www.linkedin.com/in/ivygabriel`; GitHub `https://github.com/ivygabriell`; WhatsApp `5562995024778` **somente dentro do `href` do botão** (`https://wa.me/5562995024778?text=…`), nunca como texto. Sem Instagram. O e-mail da conta Claude (`gcivy`) nunca entra no site.
- `pt.json` e `en.json` têm exatamente as mesmas chaves. Nenhum texto vazio.
- `site.example` continua `true` (e, com ele, o `noindex`) até a usuária aprovar os textos publicados.
- Commits terminam com o trailer: `git commit -m "<msg>" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"`.
- Rodar os testes do projeto com `npm test` (unitários) e `npm run test:build` (faz o build e testa o HTML).

## Review Focus

1. **Zero projetos:** com a pasta de projetos vazia o build não pode quebrar, nenhuma rota `/pt/projetos/*` ou `/en/projects/*` pode ser gerada, e a âncora `#projetos` precisa existir com os cartões "Em breve" (Task 7).
2. **WhatsApp:** a página EN deve abrir a conversa com a mensagem em inglês e a PT em português; o número não pode aparecer como texto nem em metadados (Task 6).
3. **Sobre sem habilidades:** não pode sobrar contêiner vazio nem classe `skills`/`Skill` no HTML (Task 6).
4. **Cor da animação dos Serviços:** o destino da rolagem guiada (`services.ts`) tem de ser igual ao `--c-ink`, senão o cartão "pisca" de cor no fim (Task 3).
5. **Legibilidade dos botões:** texto sobre cobalto, branco sobre cobalto (hover do botão claro) e o texto suave `ink` a 60% sobre o fundo passam de 4,5:1 (Task 2).

---

### Task 1: Guardas de congelamento (movimento e ordem das seções)

**Files:**
- Create: `tests/unit/freeze.test.ts`
- Create: `tests/build/section-order.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: dois testes que protegem as restrições "não altere animações nem estrutura" durante todas as tasks seguintes.

- [ ] **Step 1: Escrever o teste de congelamento dos scripts**

Crie `tests/unit/freeze.test.ts`:

```ts
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// SHA-256 dos arquivos de movimento no commit 9ba438a. A única mudança de cor permitida
// é o destino da animação em services.ts ('#0b1330' no lugar de '#000'), normalizada abaixo.
const FROZEN: Record<string, string> = {
  'card-video.ts': '5d627e670cfdee04bcbde9d4f7f6734512d568ca41a952f7003f3a56013a54c3',
  'clipboard-button.ts': 'e0baef521256557f5c06b51594aa5b2e3fb55b70d69797cf9fea8e2d15155a49',
  'cursor.ts': '5026b39e999c05531a8d81f07a8ceec0db6ceca8d6c3aabba5570305b5baa0d0',
  'gsap.ts': 'e94daead95c53d5b951c35038102d923953ee42477e5e6ad31bc267be8cdb4b6',
  'lang-switch.ts': '8e209133bb88ecc1accb94a2a8982a4bd5e63f3ed27a80abf61ebad4a1384325',
  'loader.ts': 'b462de8d27e286e6e13c0ac4bff6f233ade905314f3b38977c5aac6b7c08d199',
  'main.ts': '7b2700e6dd397ffbc224dd02a66fb6c5787de7a1e1829486faecd0b3cf9b54d4',
  'motion-config.ts': '9be7e895bb2bfcc86613f433653f84df31b9dc4418fd0f49c6d2a90808b4659b',
  'navbar.ts': '7517b4380e27952168a01e7b1c5b037cbe5b06f9f88c51ee564b6b837adac6ec',
  'preview.ts': '04081c3be01fa554480c5512edb298a21cd06eac81ca301b4929fc77b90862ba',
  'registry.ts': '9567b1242decc17c92f3a9a6e3f4c334f7bc54575626e5a6c3561b398da31743',
  'reveal.ts': 'a1817308ed28362a228f459ef45b220edd66ba41cc70546ca6993d309b572dcf',
  'services.ts': '013cab187b7b5acd4f877f3661a561129f3085c1f2276e437e7ac0d4f78fab72',
  'smooth-scroll.ts': 'b34ada113a2497747bd33600a9c70f8535624a459214384b2c3e7a530a2d68aa',
};

function digest(name: string): string {
  let text = readFileSync(`src/scripts/${name}`, 'utf8');
  if (name === 'services.ts') text = text.replaceAll("backgroundColor: '#0b1330'", "backgroundColor: '#000'");
  return createHash('sha256').update(text).digest('hex');
}

describe('movimento congelado', () => {
  it('não há arquivo novo nem removido em src/scripts', () => {
    expect(readdirSync('src/scripts').sort()).toEqual(Object.keys(FROZEN).sort());
  });

  it.each(Object.entries(FROZEN))('%s não mudou', (name, hash) => {
    expect(digest(name)).toBe(hash);
  });
});
```

- [ ] **Step 2: Rodar e ver passar (é uma guarda; passa por construção) e provar que ela detecta mudança**

Run: `npx vitest run -c vitest.config.ts tests/unit/freeze.test.ts`
Expected: PASS (15 testes).

Prova de que a guarda funciona (mutação temporária):

Run: `echo "// mutação" >> src/scripts/reveal.ts && npx vitest run -c vitest.config.ts tests/unit/freeze.test.ts; git checkout src/scripts/reveal.ts`
Expected: FAIL em `reveal.ts não mudou`; depois do `git checkout` o arquivo volta ao original.

Run de novo: `npx vitest run -c vitest.config.ts tests/unit/freeze.test.ts`
Expected: PASS.

- [ ] **Step 3: Escrever o teste de ordem das seções**

Crie `tests/build/section-order.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { read } from './dist';

const ORDER = ['destaque', 'sobre', 'servicos', 'projetos', 'contato'];

describe('ordem das seções', () => {
  it.each(['pt', 'en'])('%s: destaque → sobre → serviços → projetos → contato', (lang) => {
    const html = read(`${lang}/index.html`);
    const positions = ORDER.map((id) => html.indexOf(`id="${id}"`));
    positions.forEach((pos, i) => expect(pos, `id="${ORDER[i]}"`).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
```

- [ ] **Step 4: Rodar o teste de build**

Run: `npx vitest run -c vitest.build.config.ts tests/build/section-order.test.ts`
Expected: PASS (2 testes; o build roda antes, leva alguns segundos).

- [ ] **Step 5: Commit**

```bash
git add tests/unit/freeze.test.ts tests/build/section-order.test.ts
git commit -m "test: freeze motion scripts and section order" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tokens da paleta cobalto e contraste

**Files:**
- Modify: `src/styles/tokens.css:1-9`
- Create: `tests/unit/palette.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: tokens CSS `--c-bg`, `--c-ink`, `--c-mint`, `--c-lavender`, `--c-accent`, `--c-ink-soft`, `--c-line` com os valores da paleta. Tasks 3 e 4 usam `--c-accent` e `--c-ink`.

- [ ] **Step 1: Escrever o teste de paleta e contraste (RED)**

Crie `tests/unit/palette.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type RGB = [number, number, number];

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

function hex(name: string): string {
  const m = tokens.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`));
  if (!m) throw new Error(`token ${name} não é uma cor hex em tokens.css`);
  return m[1].toLowerCase();
}
const rgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: RGB) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const ratio = (a: RGB, b: RGB) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const blend = (fg: RGB, alpha: number, bg: RGB): RGB =>
  fg.map((v, i) => Math.round(v * alpha + bg[i] * (1 - alpha))) as RGB;

describe('paleta cobalto', () => {
  it('usa os valores aprovados', () => {
    expect(hex('--c-bg')).toBe('#f7f8fc');
    expect(hex('--c-ink')).toBe('#0b1330');
    expect(hex('--c-mint')).toBe('#e4eaff');
    expect(hex('--c-lavender')).toBe('#d3dcff');
    expect(hex('--c-accent')).toBe('#1f4fff');
  });

  it('o texto principal sobre o fundo passa de 4,5:1', () => {
    expect(ratio(rgb(hex('--c-ink')), rgb(hex('--c-bg')))).toBeGreaterThanOrEqual(4.5);
  });

  it('o texto do botão (fundo claro) sobre o cobalto passa de 4,5:1', () => {
    expect(ratio(rgb(hex('--c-bg')), rgb(hex('--c-accent')))).toBeGreaterThanOrEqual(4.5);
  });

  it('branco sobre o cobalto (hover do botão claro) passa de 4,5:1', () => {
    expect(ratio([255, 255, 255], rgb(hex('--c-accent')))).toBeGreaterThanOrEqual(4.5);
  });

  it('o texto suave (ink a 60%) sobre o fundo passa de 4,5:1', () => {
    const soft = blend(rgb(hex('--c-ink')), 0.6, rgb(hex('--c-bg')));
    expect(ratio(soft, rgb(hex('--c-bg')))).toBeGreaterThanOrEqual(4.5);
    expect(tokens).toMatch(/--c-ink-soft:\s*rgb\(11 19 48 \/ 0\.6\)/);
  });

  it('o texto principal sobre os dois tons de azul-gelo passa de 4,5:1', () => {
    for (const name of ['--c-mint', '--c-lavender'])
      expect(ratio(rgb(hex('--c-ink')), rgb(hex(name)))).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run -c vitest.config.ts tests/unit/palette.test.ts`
Expected: FAIL (`usa os valores aprovados`: `--c-bg` é `#fff`; `--c-accent` não existe → erro "token --c-accent não é uma cor hex").

- [ ] **Step 3: Trocar os tokens**

Em `src/styles/tokens.css`, substitua o início do arquivo (do `:root {` até `--c-line-inverse`):

```css
:root {
  --c-bg: #fff;
  --c-ink: #000;
  --c-mint: #e3f5f3;
  --c-lavender: #f1f3fa;
  --c-ink-soft: rgb(0 0 0 / 0.6);
  --c-paper-soft: rgb(255 255 255 / 0.6);
  --c-line: rgb(0 0 0 / 0.12);
  --c-line-inverse: rgb(255 255 255 / 0.2);
```

por:

```css
:root {
  --c-bg: #f7f8fc;
  --c-ink: #0b1330;
  --c-mint: #e4eaff;
  --c-lavender: #d3dcff;
  --c-accent: #1f4fff;
  --c-ink-soft: rgb(11 19 48 / 0.6);
  --c-paper-soft: rgb(255 255 255 / 0.6);
  --c-line: rgb(11 19 48 / 0.12);
  --c-line-inverse: rgb(255 255 255 / 0.2);
```

- [ ] **Step 4: Rodar e ver passar, depois toda a suíte unitária**

Run: `npx vitest run -c vitest.config.ts tests/unit/palette.test.ts`
Expected: PASS (6 testes).

Run: `npm test`
Expected: PASS em todos (freeze, tokens e os demais).

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css tests/unit/palette.test.ts
git commit -m "feat(palette): cobalt tokens with contrast tests" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Aplicar a paleta aos componentes (só cores)

**Files:**
- Modify: `src/components/Pill.astro`, `Services.astro`, `Footer.astro`, `Navbar.astro`, `GradientArt.astro`, `Highlight.astro`, `Outro.astro`, `Projects.astro`
- Modify: `src/scripts/services.ts` (somente o literal de cor)
- Modify: `src/styles/global.css` (somente o Loader)
- Create: `tests/unit/palette-usage.test.ts`

**Interfaces:**
- Consumes: tokens `--c-ink`, `--c-bg`, `--c-accent` da Task 2.
- Produces: componentes sem nenhum literal da paleta antiga; o destino da animação de Serviços igual a `--c-ink`.

- [ ] **Step 1: Escrever o teste de uso da paleta (RED)**

Crie `tests/unit/palette-usage.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (path: string) => readFileSync(`src/${path}`, 'utf8');

const LEGACY = ['#4338ca', '#818cf8', '#312e81', '#c7d2fe', '#fde68a', '#fbcfe8', '#e3f5f3', '#f1f3fa', '#111'];
const SCANNED = [
  'components/Pill.astro',
  'components/Services.astro',
  'components/Footer.astro',
  'components/Navbar.astro',
  'components/GradientArt.astro',
  'components/Highlight.astro',
  'components/Outro.astro',
  'components/Projects.astro',
  'components/ProjectPage.astro',
  'components/Panel.astro',
  'styles/global.css',
  'styles/tokens.css',
  'scripts/services.ts',
];
const NO_PURE_BLACK = [
  'components/Pill.astro',
  'components/Services.astro',
  'components/Footer.astro',
  'components/Navbar.astro',
  'components/Outro.astro',
  'components/Projects.astro',
  'scripts/services.ts',
];

describe('uso da paleta cobalto', () => {
  it.each(SCANNED)('%s não usa cores da paleta antiga', (file) => {
    const text = src(file).toLowerCase();
    for (const color of LEGACY) expect(text, `${file}: ${color}`).not.toContain(color);
  });

  it.each(NO_PURE_BLACK)('%s não usa preto puro (#000)', (file) => {
    expect(src(file).toLowerCase()).not.toContain('#000');
  });

  it('a navbar não usa branco puro nem rgb(255 255 255) como fundo', () => {
    const text = src('components/Navbar.astro');
    expect(text).not.toMatch(/background:\s*#fff/i);
    expect(text).not.toContain('rgb(255 255 255');
  });

  it('o botão sólido usa o cobalto', () => {
    expect(src('components/Pill.astro')).toContain('--pill-bg: var(--c-accent)');
  });

  it('a animação dos Serviços termina na mesma cor do --c-ink', () => {
    const ink = src('styles/tokens.css').match(/--c-ink:\s*(#[0-9a-fA-F]{6})/)![1];
    expect(src('scripts/services.ts')).toContain(`backgroundColor: '${ink}'`);
  });

  it('a cortina de transição de página usa o --c-ink', () => {
    expect(src('styles/global.css')).toMatch(/\.Loader \.fill\s*\{[^}]*background:\s*var\(--c-ink\)/);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run -c vitest.config.ts tests/unit/palette-usage.test.ts`
Expected: FAIL em vários casos (ex.: `components/Pill.astro não usa preto puro`, `GradientArt.astro … #4338ca`, `a animação dos Serviços termina…`).

- [ ] **Step 3: Aplicar as trocas de cor**

Crie e rode este script uma vez (cada troca confere a quantidade esperada de ocorrências; se uma falhar, pare e leia o arquivo):

```bash
python3 - <<'EOF'
import pathlib

def swap(path, old, new, count=1):
    p = pathlib.Path(path)
    s = p.read_text()
    found = s.count(old)
    assert found == count, f"{path}: esperava {count} ocorrência(s) de {old!r}, achei {found}"
    p.write_text(s.replace(old, new))

# Pill: sólido = cobalto; claro = fundo claro com hover cobalto; contorno = hover no fundo claro
swap('src/components/Pill.astro',
 "    --pill-bg: #000;\n    --pill-fg: #fff;\n    --pill-hover-bg: #fff;\n    --pill-hover-fg: #000;\n    --pill-border: #000;\n",
 "    --pill-bg: var(--c-accent);\n    --pill-fg: var(--c-bg);\n    --pill-hover-bg: var(--c-bg);\n    --pill-hover-fg: var(--c-accent);\n    --pill-border: var(--c-accent);\n")
swap('src/components/Pill.astro',
 "    --pill-bg: transparent;\n    --pill-fg: currentColor;\n    --pill-hover-bg: #fff;\n    --pill-hover-fg: #000;\n    --pill-border: currentColor;\n",
 "    --pill-bg: transparent;\n    --pill-fg: currentColor;\n    --pill-hover-bg: var(--c-bg);\n    --pill-hover-fg: var(--c-ink);\n    --pill-border: currentColor;\n")
swap('src/components/Pill.astro',
 "    --pill-bg: #fff;\n    --pill-fg: #000;\n    --pill-hover-bg: #000;\n    --pill-hover-fg: #fff;\n    --pill-border: #fff;\n",
 "    --pill-bg: var(--c-bg);\n    --pill-fg: var(--c-ink);\n    --pill-hover-bg: var(--c-accent);\n    --pill-hover-fg: #fff;\n    --pill-border: var(--c-bg);\n")

# Serviços: o preto vira --c-ink (4 lugares)
swap('src/components/Services.astro', "    background: #000;\n  }\n  .item__bg {", "    background: var(--c-ink);\n  }\n  .item__bg {")
swap('src/components/Services.astro', ".item:not(:first-child) {\n    color: #000;", ".item:not(:first-child) {\n    color: var(--c-ink);")
swap('src/components/Services.astro', ":global(.is-accordion) .item {\n    color: #000;", ":global(.is-accordion) .item {\n    color: var(--c-ink);")
swap('src/components/Services.astro', ".item:global(.-active) .item__fill {\n    background: #000;", ".item:global(.-active) .item__fill {\n    background: var(--c-ink);")
swap('src/scripts/services.ts', "backgroundColor: '#000'", "backgroundColor: '#0b1330'")

# Footer, Navbar
swap('src/components/Footer.astro', "  .circle:hover {\n    background: #fff;\n    color: #000;", "  .circle:hover {\n    background: var(--c-bg);\n    color: var(--c-ink);")
swap('src/components/Navbar.astro', "background: rgb(255 255 255 / 0.88);", "background: rgb(247 248 252 / 0.88);")
swap('src/components/Navbar.astro', "background: #fff;", "background: var(--c-bg);", count=2)

# Artes em gradiente e blobs do destaque: tons de cobalto
swap('src/components/GradientArt.astro', '#818cf8', '#7f9bff')
swap('src/components/GradientArt.astro', '#4338ca', '#1f4fff')
swap('src/components/Highlight.astro', '#c7d2fe', '#b7c6ff')
swap('src/components/Highlight.astro', '#fde68a', '#8fa7ff')
swap('src/components/Highlight.astro', '#fbcfe8', '#dbe4ff')
swap('src/components/Outro.astro', "#312e81 0%, #000 70%", "#1f3fbf 0%, var(--c-ink) 70%")
swap('src/components/Projects.astro', "    background: #111;", "    background: var(--c-ink);")

# Cortina de transição
swap('src/styles/global.css', "  background: rgb(0 0 0 / 0.2);\n  opacity: 0;", "  background: rgb(11 19 48 / 0.2);\n  opacity: 0;")
swap('src/styles/global.css', "  background: #000;\n  transform: scaleY(0);", "  background: var(--c-ink);\n  transform: scaleY(0);")
print('ok')
EOF
```

Expected: imprime `ok`.

- [ ] **Step 4: Rodar e ver passar; conferir que nada de movimento mudou**

Run: `npx vitest run -c vitest.config.ts tests/unit/palette-usage.test.ts tests/unit/freeze.test.ts`
Expected: PASS (inclui `services.ts não mudou`, porque a guarda normaliza só aquele literal).

Run: `npm test && npx astro check`
Expected: tudo PASS e `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add src tests/unit/palette-usage.test.ts
git commit -m "feat(palette): apply cobalt colors to components" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Imagem de compartilhamento e favicon na paleta nova

**Files:**
- Modify: `scripts/gen-og.mjs`
- Modify: `public/favicon.svg`
- Regenerate: `public/og-cover.png`
- Create: `tests/unit/brand-assets.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `public/og-cover.png` (1200×630) e `public/favicon.svg` em cobalto. O `Base.astro` já aponta para `/og-cover.png`.

- [ ] **Step 1: Escrever o teste dos assets (RED)**

Crie `tests/unit/brand-assets.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

describe('assets da marca', () => {
  it('a imagem de compartilhamento tem 1200x630', async () => {
    const meta = await sharp('public/og-cover.png').metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });

  it('a imagem de compartilhamento foi gerada na paleta cobalto (base azul vivo)', async () => {
    const { data, info } = await sharp('public/og-cover.png').raw().toBuffer({ resolveWithObject: true });
    const x = 600;
    const y = 625;
    const i = (y * info.width + x) * info.channels;
    expect(data[i + 2], 'canal azul na base da imagem').toBeGreaterThan(200);
  });

  it('o favicon e o gerador usam o cobalto e não o índigo antigo', () => {
    const favicon = readFileSync('public/favicon.svg', 'utf8').toLowerCase();
    const gen = readFileSync('scripts/gen-og.mjs', 'utf8').toLowerCase();
    expect(favicon).toContain('#1f4fff');
    expect(gen).toContain('#1f4fff');
    expect(gen).not.toContain('#4338ca');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run -c vitest.config.ts tests/unit/brand-assets.test.ts`
Expected: FAIL (`canal azul… ` abaixo de 240 e `favicon … #1f4fff`).

- [ ] **Step 3: Atualizar o gerador, o favicon e regenerar a imagem**

Substitua o conteúdo de `scripts/gen-og.mjs` por:

```js
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<defs><radialGradient id="g" cx="50%" cy="115%" r="80%"><stop offset="0" stop-color="#1f4fff"/><stop offset="1" stop-color="#0b1330"/></radialGradient></defs>
<rect width="1200" height="630" fill="#0b1330"/><rect width="1200" height="630" fill="url(#g)"/>
<text x="80" y="370" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="500" fill="#f7f8fc" letter-spacing="-2">Ivy Gabriel</text>
<text x="84" y="440" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#f7f8fc" fill-opacity=".75">Desenvolvedor Full Stack</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-cover.png');
console.log('og-cover.png generated');
```

Substitua o conteúdo de `public/favicon.svg` por:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#1f4fff"/><text x="32" y="45" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="500" fill="#f7f8fc">i</text></svg>
```

Run: `node scripts/gen-og.mjs`
Expected: `og-cover.png generated`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run -c vitest.config.ts tests/unit/brand-assets.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add scripts/gen-og.mjs public/favicon.svg public/og-cover.png tests/unit/brand-assets.test.ts
git commit -m "feat(brand): cobalt favicon and share image" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Contatos reais e utilitário do link de WhatsApp

**Files:**
- Create: `src/lib/whatsapp.ts`
- Modify: `src/content/site.ts` (reescrever)
- Create: `tests/unit/whatsapp.test.ts`, `tests/unit/site.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `whatsappUrl(number: string, message: string): string` em `src/lib/whatsapp.ts`; `site` com os campos `name`, `wordmark`, `email`, `whatsapp` (só dígitos com DDI), `example`, `socials` (GitHub e LinkedIn) e `highlightVideo`. A Task 6 consome ambos no `Outro.astro`.

- [ ] **Step 1: Escrever os testes (RED)**

Crie `tests/unit/whatsapp.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { whatsappUrl } from '../../src/lib/whatsapp';

describe('whatsappUrl', () => {
  it('monta o link wa.me com a mensagem codificada', () => {
    expect(whatsappUrl('5562995024778', 'Olá, Ivy!')).toBe('https://wa.me/5562995024778?text=Ol%C3%A1%2C%20Ivy!');
  });

  it('codifica caracteres que quebrariam a URL', () => {
    expect(whatsappUrl('5562995024778', 'a&b?c')).toContain('?text=a%26b%3Fc');
  });

  it('recusa número formatado ou vazio (só dígitos com código do país)', () => {
    expect(() => whatsappUrl('+55 62 99502-4778', 'x')).toThrow(/digits only/);
    expect(() => whatsappUrl('', 'x')).toThrow(/digits only/);
  });
});
```

Crie `tests/unit/site.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';

describe('dados do site', () => {
  it('usa o e-mail e o nome reais', () => {
    expect(site.name).toBe('Ivy Gabriel');
    expect(site.email).toBe('ivy.gabriel@icloud.com');
  });

  it('tem só GitHub e LinkedIn, com as URLs informadas', () => {
    expect(site.socials.map((s) => [s.id, s.url])).toEqual([
      ['github', 'https://github.com/ivygabriell'],
      ['linkedin', 'https://www.linkedin.com/in/ivygabriel'],
    ]);
  });

  it('o WhatsApp é só dígitos com o código do Brasil', () => {
    expect(site.whatsapp).toMatch(/^55\d{10,11}$/);
  });

  it('não contém o e-mail da conta nem o domínio de exemplo', () => {
    const dump = JSON.stringify(site).toLowerCase();
    expect(dump).not.toContain('gcivy');
    expect(dump).not.toContain('example.com');
    expect(dump).not.toContain('instagram');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run -c vitest.config.ts tests/unit/whatsapp.test.ts tests/unit/site.test.ts`
Expected: FAIL (módulo `whatsapp` não existe; `site.email` é `ola@example.com`).

- [ ] **Step 3: Implementar**

Crie `src/lib/whatsapp.ts`:

```ts
export function whatsappUrl(number: string, message: string): string {
  if (!/^\d{10,15}$/.test(number))
    throw new Error(`whatsapp number must be digits only (country code included): "${number}"`);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
```

Substitua o conteúdo de `src/content/site.ts` por:

```ts
// Dados de contato reais. Mantenha `example: true` até aprovar os textos publicados:
// enquanto for true, as páginas levam `noindex`.
export const site = {
  name: 'Ivy Gabriel',
  wordmark: 'ivy',
  email: 'ivy.gabriel@icloud.com',
  // Só dígitos, com o código do país. Aparece apenas dentro do link do botão (wa.me), nunca como texto.
  whatsapp: '5562995024778',
  example: true,
  socials: [
    { id: 'github', label: 'GitHub', short: 'GH', url: 'https://github.com/ivygabriell' },
    { id: 'linkedin', label: 'LinkedIn', short: 'IN', url: 'https://www.linkedin.com/in/ivygabriel' },
  ],
  // Caminho de um vídeo curto (ex.: '/media/destaque.mp4') ou null para só o painel em código.
  highlightVideo: null as string | null,
};
```

- [ ] **Step 4: Rodar e ver passar; suíte unitária e tipos**

Run: `npm test && npx astro check`
Expected: PASS e `0 errors`.

Run: `npm run test:build`
Expected: o teste `routes-seo`/`home-bottom` que lia `site.email` continua passando (usam `site.email` dinamicamente).

- [ ] **Step 5: Commit**

```bash
git add src/lib/whatsapp.ts src/content/site.ts tests/unit/whatsapp.test.ts tests/unit/site.test.ts
git commit -m "feat: real contacts and whatsapp redirect link helper" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Textos finais PT/EN, Sobre sem habilidades e botão de WhatsApp

**Files:**
- Modify: `src/content/pt.json`, `src/content/en.json`
- Modify: `src/components/About.astro`, `src/components/Outro.astro`
- Modify: `tests/unit/content.test.ts` (acrescentar), `tests/build/home-top.test.ts`, `tests/build/dist.ts`
- Create: `tests/build/contact.test.ts`

**Interfaces:**
- Consumes: `whatsappUrl` e `site.whatsapp`/`site.email` da Task 5; token `--c-accent` da Task 2.
- Produces: chaves de texto `projects.soon: [string, string]`, `outro.whatsappCta`, `outro.whatsappMessage`; `about` sem `skillsLabel` nem `skills`; `services.items[].href === '#contato'`. A Task 7 consome `projects.soon`.

- [ ] **Step 1: Escrever os testes (RED)**

Em `tests/build/dist.ts`, acrescente ao final:

```ts
// O Astro escapa aspas e apóstrofos no HTML; os testes de texto comparam com o texto decodificado.
export const readDecoded = (path: string) =>
  read(path)
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
```

Em `tests/unit/content.test.ts`, acrescente ao final do arquivo:

```ts
describe('textos finais', () => {
  it('o hero mostra o nome, o cargo e a frase aprovados', () => {
    expect(pt.hero.title).toBe('Ivy Gabriel, Desenvolvedor Full Stack.');
    expect(pt.hero.subtitle).toBe('Eu transformo a sua ideia em um produto digital além do convencional.');
    expect(en.hero.title).toBe('Ivy Gabriel, Full Stack Developer.');
    expect(en.hero.subtitle).toBe('I turn your idea into a digital product beyond the conventional.');
  });

  it('o Sobre não tem habilidades', () => {
    for (const about of [pt.about, en.about]) {
      expect(about).not.toHaveProperty('skills');
      expect(about).not.toHaveProperty('skillsLabel');
    }
  });

  it('há 4 serviços com os títulos aprovados, todos levando ao contato', () => {
    expect(pt.services.items.map((i) => i.title)).toEqual([
      'Sites e landing pages',
      'Aplicações web',
      'Apps mobile',
      'Automações e integrações',
    ]);
    expect(en.services.items.map((i) => i.title)).toEqual([
      'Websites and landing pages',
      'Web applications',
      'Mobile apps',
      'Automations and integrations',
    ]);
    for (const item of [...pt.services.items, ...en.services.items]) expect(item.href).toBe('#contato');
  });

  it('Projetos tem dois cartões "Em breve" em cada idioma', () => {
    expect(pt.projects.soon).toHaveLength(2);
    expect(en.projects.soon).toHaveLength(2);
  });

  it('o contato tem o botão e a mensagem de WhatsApp em cada idioma', () => {
    expect(pt.outro.whatsappCta).toBe('Chamar no WhatsApp');
    expect(en.outro.whatsappCta).toBe('Message on WhatsApp');
    expect(pt.outro.whatsappMessage).toContain('Ivy');
    expect(en.outro.whatsappMessage).toContain('Ivy');
    expect(en.outro.title).toBe('Have an idea to get off the ground?');
  });
});
```

Em `tests/build/home-top.test.ts`, substitua o primeiro `it.each` (o de `hero, destaque e sobre com habilidades`) por:

```ts
  it.each([['pt', pt], ['en', en]] as const)('%s: hero, destaque e sobre (sem habilidades)', (lang, t) => {
    const html = read(`${lang}/index.html`);
    expect(html).toContain(t.hero.title);
    expect(html).toContain(t.hero.subtitle);
    expect(html).toContain('id="destaque"');
    expect(html).toContain('id="sobre"');
    expect(html).not.toMatch(/class="[^"]*\bskills\b/);
    expect(html).not.toMatch(/class="[^"]*\bSkill\b/);
    expect(html).toContain('data-reveal="words"');
  });
```

Crie `tests/build/contact.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { site } from '../../src/content/site';
import { whatsappUrl } from '../../src/lib/whatsapp';
import { readDecoded } from './dist';

describe('contato', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: botão de WhatsApp com a mensagem no idioma da página', (lang, t) => {
    const html = readDecoded(`${lang}/index.html`);
    expect(html).toContain(`href="${whatsappUrl(site.whatsapp, t.outro.whatsappMessage)}"`);
    expect(html).toContain(t.outro.whatsappCta);
  });

  it('o número de WhatsApp só aparece dentro do href do botão', () => {
    for (const lang of ['pt', 'en']) {
      const withoutLinks = readDecoded(`${lang}/index.html`).replace(/href="https:\/\/wa\.me\/[^"]*"/g, '');
      expect(withoutLinks).not.toContain(site.whatsapp);
      expect(withoutLinks).not.toContain('99502');
      expect(withoutLinks).not.toContain('95024778');
    }
  });

  it('o e-mail novo aparece e o de exemplo, o da conta e o Instagram não', () => {
    for (const lang of ['pt', 'en']) {
      const html = readDecoded(`${lang}/index.html`).toLowerCase();
      expect(html).toContain(site.email);
      expect(html).not.toContain('ola@example.com');
      expect(html).not.toContain('gcivy');
      expect(html).not.toContain('instagram');
    }
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run -c vitest.config.ts tests/unit/content.test.ts`
Expected: FAIL nos casos de `textos finais` (título do hero antigo, `skills` ainda existe).

- [ ] **Step 3: Atualizar os textos**

Rode este script (altera apenas as chaves listadas e preserva as demais, como `highlight`, `nav` e `footer`):

```bash
python3 - <<'EOF'
import json, pathlib

def load(lang):
    return json.loads(pathlib.Path(f'src/content/{lang}.json').read_text())

def save(lang, data):
    pathlib.Path(f'src/content/{lang}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

pt = load('pt')
pt['meta']['title'] = 'Ivy Gabriel — Desenvolvedor Full Stack'
pt['meta']['description'] = 'Sites, sistemas, apps e automações sob medida. Fale com Ivy Gabriel e transforme sua ideia em produto.'
pt['hero']['title'] = 'Ivy Gabriel, Desenvolvedor Full Stack.'
pt['hero']['subtitle'] = 'Eu transformo a sua ideia em um produto digital além do convencional.'
pt['about']['text'] = ('Eu sou desenvolvedor full stack e trabalho do banco de dados à tela. '
    'Gosto de começar pelo problema, conversar com calma e só então escrever o código que o resolve. '
    'Explico cada etapa em linguagem simples, sem jargão. '
    'Se você tem um processo manual, um sistema lento ou uma ideia sem time técnico, é aqui que eu ajudo.')
del pt['about']['skillsLabel']
del pt['about']['skills']
pt['services']['items'] = [
    {'title': 'Sites e landing pages', 'text': 'Sua marca com um site que tem desempenho, passa confiança e leva o visitante a falar com você.', 'href': '#contato'},
    {'title': 'Aplicações web', 'text': 'Troque planilhas e tarefas manuais por um sistema feito para o jeito como o seu negócio funciona.', 'href': '#contato'},
    {'title': 'Apps mobile', 'text': 'Seu serviço no bolso do cliente, com um app rápido, fácil de usar e pronto para crescer.', 'href': '#contato'},
    {'title': 'Automações e integrações', 'text': 'Ferramentas conectadas e tarefas repetitivas no automático.', 'href': '#contato'},
]
pt['projects']['soon'] = ['Em breve: um projeto que estou finalizando agora.', 'Em breve: o próximo projeto pode ser o seu.']
pt['outro']['whatsappCta'] = 'Chamar no WhatsApp'
pt['outro']['whatsappMessage'] = 'Olá, Ivy! Vi seu portfólio e quero conversar sobre um projeto.'
save('pt', pt)

en = load('en')
en['meta']['title'] = 'Ivy Gabriel — Full Stack Developer'
en['meta']['description'] = 'Custom websites, systems, apps and automations. Talk to Ivy Gabriel and turn your idea into a product.'
en['hero']['title'] = 'Ivy Gabriel, Full Stack Developer.'
en['hero']['subtitle'] = 'I turn your idea into a digital product beyond the conventional.'
en['about']['text'] = ("I'm a full stack developer and I work from the database to the screen. "
    'I like to start from the problem, talk things through and only then write the code that solves it. '
    'I explain every step in plain language, no jargon. '
    "If you have a manual process, a slow system or an idea without a technical team, that's where I help.")
del en['about']['skillsLabel']
del en['about']['skills']
en['services']['items'] = [
    {'title': 'Websites and landing pages', 'text': 'Your brand with a site that performs, inspires trust and leads visitors to get in touch.', 'href': '#contato'},
    {'title': 'Web applications', 'text': 'Replace spreadsheets and manual tasks with a system built around how your business works.', 'href': '#contato'},
    {'title': 'Mobile apps', 'text': "Your service in your customer's pocket, with a fast, easy-to-use app ready to grow.", 'href': '#contato'},
    {'title': 'Automations and integrations', 'text': 'Connected tools and repetitive tasks on autopilot.', 'href': '#contato'},
]
en['projects']['soon'] = ["Coming soon: a project I'm finishing right now.", 'Coming soon: the next project could be yours.']
en['outro']['title'] = 'Have an idea to get off the ground?'
en['outro']['whatsappCta'] = 'Message on WhatsApp'
en['outro']['whatsappMessage'] = "Hi Ivy! I saw your portfolio and I'd like to talk about a project."
save('en', en)
print('ok')
EOF
```

Expected: imprime `ok`.

- [ ] **Step 4: Remover as habilidades do `About.astro` e acrescentar o botão no `Outro.astro`**

Em `src/components/About.astro`, aplique:

```bash
python3 - <<'EOF'
import pathlib
p = pathlib.Path('src/components/About.astro')
s = p.read_text()
block = """  <div class="grid">
    <h2 class="label" data-reveal="fade">{t.skillsLabel}</h2>
    <ul class="skills">
      {t.skills.map((s) => <li class="Skill" data-reveal="scale">{s}</li>)}
    </ul>
  </div>
"""
assert s.count(block) == 1
s = s.replace(block, '')
css_skill = """  .Skill {
    padding: 1.2rem 2.4rem;
    border: 1px solid var(--c-ink);
    border-radius: var(--r-pill);
    font-size: 2rem;
  }
"""
assert s.count(css_skill) == 1
s = s.replace(css_skill, '')
assert s.count("  .skills,\n  .socials {") == 1
s = s.replace("  .skills,\n  .socials {", "  .socials {")
p.write_text(s)
print('ok')
EOF
```

Em `src/components/Outro.astro`, aplique:

```bash
python3 - <<'EOF'
import pathlib
p = pathlib.Path('src/components/Outro.astro')
s = p.read_text()

def swap(old, new):
    global s
    assert s.count(old) == 1, old
    s = s.replace(old, new)

swap("import { site } from '../content/site';\n", "import { site } from '../content/site';\nimport { whatsappUrl } from '../lib/whatsapp';\n")
swap("const t = copy[Astro.props.locale].outro;\n", "const t = copy[Astro.props.locale].outro;\nconst whatsapp = whatsappUrl(site.whatsapp, t.whatsappMessage);\n")
swap("""    <Pill
      variant="light"
      type="button"
      data-clipboard-copy={site.email}
      data-copied={t.copied}
      data-failed={t.copyFailed}
      data-cursor-icon="arrow-up-right">{t.cta}</Pill
    >
""", """    <div class="actions">
      <Pill
        variant="light"
        type="button"
        data-clipboard-copy={site.email}
        data-copied={t.copied}
        data-failed={t.copyFailed}
        data-cursor-icon="arrow-up-right">{t.cta}</Pill
      >
      <Pill variant="outline" href={whatsapp} target="_blank" rel="noopener" data-cursor-icon="arrow-up-right">{t.whatsappCta}</Pill>
    </div>
""")
swap("  .mail {\n", """  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.6rem;
  }
  .mail {
""")
swap("""    .inner {
      justify-items: start;
    }
""", """    .inner {
      justify-items: start;
    }
    .actions {
      justify-content: flex-start;
    }
""")
p.write_text(s)
print('ok')
EOF
```

Expected: imprime `ok` nos dois.

- [ ] **Step 5: Rodar a suíte inteira e os tipos**

Run: `npm test && npx astro check`
Expected: PASS e `0 errors` (a paridade PT/EN continua valendo).

Run: `npm run test:build`
Expected: PASS em `home-top`, `contact`, `home-bottom` (serviços antes de projetos; títulos novos), `section-order`, `no-js-safe`, `a11y-structure`. Os testes que dependem de projetos continuam passando porque os 4 exemplos ainda existem nesta task.

- [ ] **Step 6: Commit**

```bash
git add src tests
git commit -m "feat(content): final PT/EN copy, about without skills, whatsapp button" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Projetos "Em breve" e remoção dos exemplos

**Files:**
- Delete: `src/content/projects/aurora.json`, `atlas.json`, `pulso.json`, `nimbus.json`; `public/media/projects/` (pasta inteira); `scripts/gen-mock-media.mjs`
- Modify: `src/lib/projects.ts` (acrescentar `showComingSoon`), `src/components/Projects.astro`
- Modify: `tests/unit/projects.test.ts`, `tests/unit/content.test.ts`, `tests/build/project-pages.test.ts`, `tests/build/a11y-structure.test.ts`, `tests/build/home-bottom.test.ts`
- Create: `tests/build/projects-soon.test.ts`

**Interfaces:**
- Consumes: `copy[locale].projects.soon: string[]` da Task 6; `GradientArt` (variantes `'arch' | 'hex' | 'tri'`).
- Produces: `showComingSoon(projects: Project[]): boolean` em `src/lib/projects.ts`; `Projects.astro` com cartões "Em breve" quando não há projetos.

- [ ] **Step 1: Remover os exemplos**

```bash
git rm -q src/content/projects/aurora.json src/content/projects/atlas.json src/content/projects/pulso.json src/content/projects/nimbus.json scripts/gen-mock-media.mjs
git rm -rq public/media/projects
ls src/content/projects 2>/dev/null; ls public/media 2>/dev/null; echo "removido"
```

Expected: imprime `removido` (as pastas podem não existir mais).

Garanta que a pasta de projetos existe para o `import.meta.glob`:

```bash
mkdir -p src/content/projects && touch src/content/projects/.gitkeep
git add src/content/projects/.gitkeep
```

- [ ] **Step 2: Escrever/atualizar os testes (RED)**

Em `tests/unit/projects.test.ts`, no `import` da primeira linha troque por:

```ts
import { buildProjects, nextProject, parseProject, showComingSoon } from '../../src/lib/projects';
```

e acrescente ao final do arquivo:

```ts
describe('showComingSoon', () => {
  it('mostra "Em breve" só quando não há nenhum projeto', () => {
    expect(showComingSoon([])).toBe(true);
    expect(showComingSoon(buildProjects({ 'a.json': base('a', 1) }))).toBe(false);
  });
});
```

Em `tests/unit/content.test.ts`, substitua o bloco `describe('projetos reais', ...)` inteiro por:

```ts
describe('projetos', () => {
  const projects = loadProjects();

  it('nenhum projeto de exemplo é publicado', () => {
    for (const p of projects) expect(p.example, p.slug).toBe(false);
  });

  it('toda mídia referenciada existe em public/', () => {
    for (const p of projects)
      for (const file of [p.cover, ...p.shots])
        expect(existsSync(`public${file}`), `${p.slug}: ${file}`).toBe(true);
  });
});
```

Em `tests/build/project-pages.test.ts`, troque cada `it(` dos quatro testes por `it.skipIf(projects.length === 0)(` (mantendo o corpo e o nome de cada um), de modo que, por exemplo, o primeiro fique:

```ts
  it.skipIf(projects.length === 0)('existe uma página por projeto nos dois idiomas', () => {
```

Em `tests/build/a11y-structure.test.ts`, no teste `o link de e-mail do footer expõe o endereço visível…`, troque a linha

```ts
    const html = read(`pt/projetos/${loadProjects()[0].slug}/index.html`);
```

por

```ts
    const html = read('pt/index.html');
```

e remova a linha `import { loadProjects } from '../../src/lib/projects';` do topo (ela deixa de ser usada).

Em `tests/build/home-bottom.test.ts`, no topo troque o `import { loadProjects }` mantendo-o, e troque o teste `lista todos os projetos, cada um apontando para a página do idioma` por:

```ts
  it.skipIf(loadProjects().length === 0)('lista todos os projetos, cada um apontando para a página do idioma', () => {
    const projects = loadProjects();
    const pt = read('pt/index.html');
    const en = read('en/index.html');
    for (const p of projects) {
      expect(pt).toContain(`href="/pt/projetos/${p.slug}/"`);
      expect(en).toContain(`href="/en/projects/${p.slug}/"`);
      expect(pt).toContain(p.pt.caption);
    }
  });
```

Crie `tests/build/projects-soon.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { loadProjects } from '../../src/lib/projects';
import { exists, readDecoded } from './dist';

describe.skipIf(loadProjects().length > 0)('sem projetos reais', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: mostra os cartões "Em breve" sem links de projeto', (lang, t) => {
    const html = readDecoded(`${lang}/index.html`);
    const section = html.slice(html.indexOf('id="projetos"'), html.indexOf('id="contato"'));
    expect(section.length).toBeGreaterThan(0);
    for (const text of t.projects.soon) expect(section).toContain(text);
    expect(section).not.toMatch(/href="\/(pt|en)\/(projetos|projects)\//);
  });

  it('nenhuma página de projeto é gerada', () => {
    expect(exists('pt/projetos')).toBe(false);
    expect(exists('en/projects')).toBe(false);
  });
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npx vitest run -c vitest.config.ts tests/unit/projects.test.ts`
Expected: FAIL (`showComingSoon` não existe).

Run: `npm run test:build`
Expected: o build conclui (ou aponta o erro a tratar na Step 5) e `projects-soon` FAIL, porque a seção ainda renderiza uma lista vazia.

- [ ] **Step 4: Implementar**

Em `src/lib/projects.ts`, acrescente depois de `loadProjects`:

```ts
export function showComingSoon(projects: Project[]): boolean {
  return projects.length === 0;
}
```

Em `src/components/Projects.astro`, troque tudo que vem **antes** de `<style>` (frontmatter e marcação) por:

```astro
---
import { copy } from '../lib/copy';
import { projectPath, type Locale } from '../lib/i18n';
import { loadProjects, showComingSoon } from '../lib/projects';
import GradientArt from './GradientArt.astro';

interface Props { locale: Locale }
const { locale } = Astro.props;
const t = copy[locale].projects;
const projects = loadProjects();
const soon = showComingSoon(projects);
const variants = ['arch', 'hex'] as const;
---

<section class="Projects -inverse" id="projetos">
  <div class="container--narrow head">
    <h2 data-reveal="words">{t.title}</h2>
  </div>
  <ul class="cards container--narrow">
    {soon
      ? t.soon.map((text, i) => (
          <li class="cell">
            <div class="Card -soon" data-reveal="fade-up">
              <div class="Card__media"><GradientArt variant={variants[i % variants.length]} /></div>
              <p class="Card__caption">{text}</p>
            </div>
          </li>
        ))
      : projects.map((p) => (
          <li class="cell">
            <a class="Card" href={projectPath(locale, p.slug)} data-cursor-icon="arrow-up-right" data-reveal="fade-up">
              <div class="Card__media">
                {p.video
                  ? <video src={p.video} poster={p.cover} muted loop playsinline preload="none"></video>
                  : <img src={p.cover} alt={p[locale].title} width="1600" height="1000" loading="lazy" />}
              </div>
              <p class="Card__caption">{p[locale].caption}</p>
              <span class="sr-only">{t.view}: {p[locale].title}</span>
            </a>
          </li>
        ))}
  </ul>
</section>

```

(a linha em branco final antes de `<style>` é intencional).

Ainda em `Projects.astro`, dentro do `<style>`, acrescente antes do bloco `@media (max-width: 767px) {` que contém `.Projects {`:

```css
  .Card.-soon .Card__media {
    background: var(--c-accent);
  }
```

- [ ] **Step 5: Rodar tudo**

Run: `npm test && npx astro check`
Expected: PASS e `0 errors`.

Run: `npm run test:build`
Expected: PASS, incluindo `projects-soon` (2 idiomas + sem rotas de projeto). Se o build reclamar de `getStaticPaths` vazio nas rotas `[slug]`, confirme que `src/pages/pt/projetos/[slug].astro` e `src/pages/en/projects/[slug].astro` retornam `[]` (o `map` de uma lista vazia já retorna `[]`); o Astro aceita lista vazia. Se mesmo assim falhar, pare e investigue com `npm run build`, sem criar contorno.

- [ ] **Step 6: Commit**

```bash
git add -A src public scripts tests
git commit -m "feat(projects): coming-soon cards and remove example projects" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: README, verificação final e abertura local

**Files:**
- Modify: `README.md` (itens 1 a 6 da seção de conteúdo)

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: README fiel ao novo fluxo; site de pé em `http://localhost:4321/pt/` para a usuária ver.

- [ ] **Step 1: Atualizar o README**

Leia `README.md` (linhas 10 a 30) e substitua os itens numerados 1 a 6 da seção de personalização por:

```markdown
1. `src/content/site.ts`: nome, e-mail, WhatsApp (só dígitos com DDI; aparece só dentro do link do botão), redes e vídeo do destaque. Mantenha `example: true` até aprovar os textos; ao virar `false`, o `noindex` some.
2. `src/content/pt.json` e `src/content/en.json`: todos os textos. As duas línguas precisam ter exatamente as mesmas chaves (`npm test` confere).
3. `src/content/projects/*.json`: um arquivo por projeto, com o nome igual ao `slug`. Enquanto a pasta estiver vazia, a seção Projetos mostra os cartões "Em breve" (`projects.soon` nos JSONs de texto); ao adicionar o primeiro projeto real, os cartões somem sozinhos. Aponte `cover` e `shots` para imagens em `public/media/projects/<slug>/`. `link` ainda não é exibido em nenhuma página. Para cartão de compartilhamento por projeto, use PNG/JPG (o `og:image` hoje é sempre `public/og-cover.png`).
4. Cores: edite os tokens em `src/styles/tokens.css` (`--c-accent` é o cobalto dos botões).
5. Troque `public/og-cover.png` (rode `node scripts/gen-og.mjs` ou ponha sua imagem 1200×630).
6. No deploy, defina `SITE_URL` e rode `npm test && npm run build`.
```

- [ ] **Step 2: Verificação completa**

Run: `npm test`
Expected: PASS em todos os arquivos.

Run: `npm run test:build`
Expected: PASS em todos os arquivos.

Run: `npx astro check`
Expected: `0 errors`.

Run: `git diff 9ba438a --stat -- src/scripts`
Expected: somente `src/scripts/services.ts` com 1 linha alterada.

- [ ] **Step 3: Lighthouse nas duas páginas**

Run (o preview serve o build já feito):

```bash
npm run build >/dev/null 2>&1 && (npm run preview -- --port 4322 >/dev/null 2>&1 &) && sleep 4
for l in pt en; do
  npx --yes lighthouse "http://localhost:4322/$l/" --only-categories=performance,accessibility --chrome-flags="--headless=new" --quiet --output=json --output-path="/tmp/lh-$l.json" >/dev/null 2>&1
  node -e "const r=require('/tmp/lh-$l.json');console.log('$l','perf',Math.round(r.categories.performance.score*100),'a11y',Math.round(r.categories.accessibility.score*100))"
done
pkill -f "astro preview" || true
```

Expected: para `pt` e `en`, `perf` ≥ 95 e `a11y` ≥ 98. Se algum ficar abaixo, abra o relatório (`/tmp/lh-<lang>.json`), corrija a causa (normalmente contraste ou foco) com um teste novo que falhe antes, e repita.

- [ ] **Step 4: Conferência visual e abertura local**

Garanta o servidor de desenvolvimento e abra no navegador:

```bash
curl -sI http://localhost:4321/pt/ | head -1 || true
```

Se não responder `200`, inicie com `npm run dev` em segundo plano (Bash com `run_in_background: true`) e aguarde a porta 4321.

```bash
open http://localhost:4321/pt/
```

Confira no navegador (desktop e janela estreita): hero com o novo título, Destaque, Sobre sem habilidades, 4 serviços (rolagem guiada termina em azul-noite, sem "piscar"), Projetos "Em breve", Contato com os dois botões, footer com GitHub e LinkedIn, troca para `/en/`, botão do WhatsApp abrindo a conversa com a mensagem do idioma.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update README for real content and cobalt palette" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
