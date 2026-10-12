# Portfólio Ivy Gabriel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o portfólio bilíngue (PT + EN) de Ivy Gabriel, estático, com a linguagem visual e o sistema de animação do Cuberto, na versão enxuta de 6 seções.

**Architecture:** Site Astro estático. Cada seção é um componente `.astro` com marcação semântica e CSS próprio; o comportamento (rolagem suave, revelações, cursor, scrub dos serviços, transição de página) vive em módulos TypeScript pequenos em `src/scripts/`, registrados em um registro central que monta e desmonta tudo a cada página (necessário por causa do `ClientRouter`). Textos ficam em JSON por idioma e projetos em um JSON por projeto; a lógica pura (i18n, validação de conteúdo, flags de movimento, estado do cursor, cópia para a área de transferência) fica em `src/lib/` e é testada com Vitest.

**Tech Stack:** Astro (estático, `ClientRouter`, i18n nativo), GSAP (ScrollTrigger + SplitText), Lenis, `@fontsource/instrument-sans`, `@astrojs/sitemap`, Vitest, sharp (só para gerar a imagem Open Graph).

**Spec:** `docs/superpowers/specs/2026-10-12-portfolio-design.md`

## Global Constraints

Valores copiados do spec; todo task os herda.

- Astro estático com `ClientRouter` + GSAP (ScrollTrigger e SplitText) + Lenis. Sem framework de UI.
- Fonte: Instrument Sans, pesos 400 e 500. A Suisse Intl (do Cuberto) **não** é usada.
- Escala fluida: `1rem = 0.625vw` no desktop e `1rem = 2.667vw` no mobile; ponto de corte em 768px; limites mínimo e máximo no desktop.
- Rotas: `/pt/`, `/en/`, `/pt/projetos/[slug]`, `/en/projects/[slug]`; `/` redireciona para o idioma do navegador.
- `pt.json` e `en.json` têm exatamente as mesmas chaves; todo projeto tem os dois idiomas.
- `prefers-reduced-motion` desliga animações de GSAP, o Lenis e o cursor customizado.
- Cursor customizado e Lenis só em dispositivos com ponteiro fino e sem toque.
- `will-change` somente durante a execução da animação.
- Easing padrão `cubic-bezier(.16,1,.3,1)` (0,8s em `transform`); curva elástica `cubic-bezier(.34,4.56,.64,1)` (0,7s) nos botões.
- Nenhum código, asset, texto ou fonte do Cuberto é copiado. Todo texto em primeira pessoa e neutro quanto a gênero.
- Conteúdo inicial é de exemplo e fica claramente marcado (`example: true`); enquanto houver conteúdo de exemplo, as páginas levam `noindex`.
- Lighthouse acima de 90 em desempenho e acessibilidade.
- Commits terminam com a linha `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (use dois `-m`: um para a mensagem e outro para essa linha).

## Review Focus

Entradas e condições que o spec implica mas que nenhum teste de seção cobriria sozinho, da mais provável para a menos. Cada linha tem o teste no task que dona o código.

1. **Visitante sem JavaScript, ou com o script falhando:** o conteúdo precisa estar visível. Nada fica escondido por estilo inline ou por regra que não dependa da classe `.motion` (Task 8); há um timeout de segurança (`.motion-failed`) que mostra tudo se o script não subir (Task 7).
2. **Visitante com `prefers-reduced-motion`:** sem Lenis, sem cursor, sem estados iniciais escondidos, sem loader de página (Task 7 testa as flags; Task 8 testa que a classe `.motion` só é adicionada fora do modo reduzido).
3. **`navigator.language` fora do padrão** (`fr-CA`, `pt-PT`, `PT`, lista vazia, primeiro idioma `en` e segundo `pt`): `pickLocale` nunca lança e sempre devolve `pt` ou `en` (Task 2).
4. **Navegar casa → projeto → casa várias vezes:** scripts não podem duplicar (um só Lenis, sem ScrollTriggers órfãos, sem listeners repetidos); o `cleanup` roda mesmo se um deles falhar (Task 7).
5. **Último projeto e área de transferência indisponível:** "Próximo projeto" do último volta ao primeiro (e some se há só um projeto) (Task 3); copiar o e-mail sem `navigator.clipboard` ou com permissão negada não lança e mostra o endereço para cópia manual (Task 12).
6. **Slug ou tradução inválida em um projeto:** o build falha com mensagem que cita o arquivo e o campo, em vez de gerar uma página quebrada (Task 3).

---

## File Structure

```
package.json, astro.config.mjs, tsconfig.json, .gitignore, .env.example, README.md
vitest.config.ts                    # testes unitários (tests/unit)
vitest.build.config.ts              # testes sobre dist/ (tests/build), roda o build uma vez
public/favicon.svg, public/og-cover.png, public/media/projects/<slug>/*.svg
scripts/gen-mock-media.mjs, scripts/gen-og.mjs
src/env.d.ts
src/styles/tokens.css               # tokens + escala fluida de rem
src/styles/global.css               # reset, tipografia, container, estados de movimento
src/lib/i18n.ts                     # locales, rotas, pickLocale, switchLocalePath
src/lib/copy.ts                     # copy[locale] tipado a partir do JSON
src/lib/projects.ts                 # parseProject, buildProjects, loadProjects, nextProject
src/lib/capabilities.ts             # readEnv, motionFlags
src/lib/clipboard.ts                # copyText
src/lib/nav-state.ts                # nextNavState
src/lib/cursor-state.ts             # resolveCursorState, ICONS
src/content/site.ts                 # nome, e-mail, redes, vídeo do destaque
src/content/pt.json, en.json        # textos
src/content/projects/*.json         # um por projeto
src/layouts/Base.astro              # head, SEO, scripts, cursor e loader persistentes
src/components/                     # Pill, Navbar, Panel, Hero, Highlight, About, GradientArt,
                                    # Services, Projects, Outro, Footer, Home, ProjectPage
src/pages/index.astro               # redireciona por idioma
src/pages/pt/index.astro, en/index.astro
src/pages/pt/projetos/[slug].astro, en/projects/[slug].astro
src/scripts/gsap.ts, registry.ts, motion-config.ts, main.ts, smooth-scroll.ts, reveal.ts,
            navbar.ts, preview.ts, services.ts, cursor.ts, card-video.ts,
            clipboard-button.ts, lang-switch.ts, loader.ts
tests/unit/*.test.ts
tests/build/global-setup.ts, dist.ts, *.test.ts
```

Regra de organização: lógica pura em `src/lib` (testável sem navegador); tudo que toca o DOM ou o GSAP em `src/scripts`, sempre registrado via `register()`.

---

### Task 1: Projeto Astro, ferramentas e tokens de escala fluida

**Files:**
- Create: `package.json` (via npm), `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/env.d.ts`, `vitest.config.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/pages/index.astro` (provisória)
- Test: `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: variáveis CSS (`--c-*`, `--font`, `--ease-out`, `--ease-spring`, `--r-*`, `--gutter`, `--narrow`, `--fs-*`, `--pill-h`, `--pill-px`), classes `.container`, `.container--narrow`, `.-inverse`, `.label`, `.sr-only`; scripts npm `dev`, `build`, `preview`, `check`, `test`, `test:build`.

- [ ] **Step 1: Inicializar o projeto e instalar dependências**

Run (em `~/portfolio`):
```bash
npm init -y
npm pkg set name=portfolio type=module private=true version=0.1.0
npm pkg set scripts.dev="astro dev" scripts.build="astro build" scripts.preview="astro preview" scripts.check="astro check"
npm pkg set scripts.test="vitest run -c vitest.config.ts" "scripts.test:build=vitest run -c vitest.build.config.ts"
npm install astro gsap lenis @fontsource/instrument-sans @astrojs/sitemap
npm install -D vitest typescript @astrojs/check sharp
```
Expected: instala sem erro; `package.json` lista as dependências. Anote em `README.md` (Task 13) as versões instaladas.

- [ ] **Step 2: Escrever o teste que falha**

`tests/unit/tokens.test.ts`:
```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');

describe('tokens de escala fluida', () => {
  it('desktop: 1rem acompanha 0.625vw', () => {
    expect(tokens).toMatch(/html\s*\{[^}]*font-size:\s*clamp\([^)]*0\.625vw[^)]*\)/);
  });

  it('mobile (até 767px): 1rem acompanha 2.66667vw', () => {
    expect(tokens).toContain('@media (max-width: 767px)');
    expect(tokens).toMatch(/@media \(max-width: 767px\)\s*\{\s*html\s*\{[^}]*2\.66667vw/);
  });

  it('usa Instrument Sans e não referencia a fonte comercial do Cuberto', () => {
    expect(tokens).toContain('Instrument Sans');
    expect(tokens.toLowerCase()).not.toContain('suisse');
  });

  it('define as curvas de easing medidas no Cuberto', () => {
    expect(tokens).toContain('cubic-bezier(0.16, 1, 0.3, 1)');
    expect(tokens).toContain('cubic-bezier(0.34, 4.56, 0.64, 1)');
  });
});
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
});
```

- [ ] **Step 3: Rodar o teste e ver falhar**

Run: `npm test`
Expected: FAIL (`ENOENT ... src/styles/tokens.css`).

- [ ] **Step 4: Criar configuração, tokens e estilos globais**

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? 'https://example.com';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({ i18n: { defaultLocale: 'pt', locales: { pt: 'pt-BR', en: 'en' } } }),
  ],
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

`.gitignore`:
```
node_modules
dist
.astro
.DS_Store
.env
```

`src/env.d.ts`:
```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

`src/styles/tokens.css`:
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

  --font: 'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 4.56, 0.64, 1);

  --r-card: 2rem;
  --r-panel: 2.5rem;
  --r-top: 8rem;
  --r-pill: 99999px;

  --gutter: 12rem;
  --narrow: 24rem;

  --fs-h1: 9rem;
  --fs-h2: 7rem;
  --fs-title: 4.2rem;
  --fs-lead: 2.8rem;
  --fs-sub: 2.4rem;
  --fs-body: max(1.8rem, 15px);
  --fs-small: max(1.4rem, 12px);

  --pill-h: 5.8rem;
  --pill-px: 2.8rem;
}

html {
  font-size: clamp(8px, 0.625vw, 12px);
}

@media (max-width: 767px) {
  html {
    font-size: 2.66667vw;
  }
  :root {
    --gutter: 2rem;
    --narrow: 2rem;
    --fs-h1: 4.5rem;
    --fs-h2: 4.2rem;
    --fs-title: 3.2rem;
    --fs-lead: 2.4rem;
    --fs-sub: 2rem;
    --pill-h: 4rem;
    --pill-px: 2.4rem;
  }
}
```

`src/styles/global.css`:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

html.menu-open {
  overflow: hidden;
}

body {
  margin: 0;
  font-family: var(--font);
  font-size: var(--fs-body);
  font-weight: 400;
  line-height: 1.3;
  color: var(--c-ink);
  background: var(--c-bg);
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

h1,
h2,
h3,
p,
ul,
ol {
  margin: 0;
  padding: 0;
}

ul,
ol {
  list-style: none;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

img,
video,
svg {
  display: block;
  max-width: 100%;
}

:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

.container {
  padding-inline: var(--gutter);
}

.container--narrow {
  padding-inline: var(--narrow);
}

.-inverse {
  background: var(--c-ink);
  color: #fff;
}

.label {
  font-size: var(--fs-small);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
```

`src/pages/index.astro` (provisória, será reescrita na Task 4):
```astro
---
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '../styles/tokens.css';
import '../styles/global.css';
---
<html lang="pt-BR">
  <head><meta charset="utf-8" /><title>Portfólio</title></head>
  <body><h1 class="container">Portfólio</h1></body>
</html>
```

- [ ] **Step 5: Rodar teste e build**

Run: `npm test && npm run build`
Expected: 4 testes PASS; build conclui e gera `dist/index.html`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro project with fluid rem tokens" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Núcleo de i18n (idiomas, rotas, detecção)

**Files:**
- Create: `src/lib/i18n.ts`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces (exatos):
  - `LOCALES`, `type Locale = 'pt' | 'en'`, `DEFAULT_LOCALE: Locale`, `HTML_LANG: Record<Locale,string>`, `PROJECT_SEGMENT: Record<Locale,string>`
  - `isLocale(v: unknown): v is Locale`, `otherLocale(l: Locale): Locale`
  - `homePath(l: Locale): string` → `/pt/`
  - `projectPath(l: Locale, slug: string): string` → `/pt/projetos/slug/`
  - `pickLocale(languages: readonly string[]): Locale`
  - `withHash(path: string, hash: string): string`
  - `switchLocalePath(pathname: string, to: Locale): string`

- [ ] **Step 1: Escrever os testes que falham**

`tests/unit/i18n.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE, HTML_LANG, homePath, isLocale, otherLocale, pickLocale,
  projectPath, switchLocalePath, withHash,
} from '../../src/lib/i18n';

describe('rotas', () => {
  it('monta o caminho da home e do projeto em cada idioma', () => {
    expect(homePath('pt')).toBe('/pt/');
    expect(homePath('en')).toBe('/en/');
    expect(projectPath('pt', 'aurora')).toBe('/pt/projetos/aurora/');
    expect(projectPath('en', 'aurora')).toBe('/en/projects/aurora/');
  });

  it('expõe o lang do HTML e o idioma padrão', () => {
    expect(HTML_LANG).toEqual({ pt: 'pt-BR', en: 'en' });
    expect(DEFAULT_LOCALE).toBe('pt');
  });

  it('isLocale e otherLocale', () => {
    expect(isLocale('pt')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(otherLocale('pt')).toBe('en');
    expect(otherLocale('en')).toBe('pt');
  });
});

describe('pickLocale', () => {
  it.each([
    [['pt-BR'], 'pt'],
    [['pt-PT'], 'pt'],
    [['PT'], 'pt'],
    [['en-US'], 'en'],
    [['fr-CA'], 'en'],
    [['en-US', 'pt-BR'], 'en'],
    [['pt-BR', 'en-US'], 'pt'],
    [['', ' ', 'pt'], 'pt'],
    [[], 'pt'],
  ])('%j -> %s', (langs, expected) => {
    expect(pickLocale(langs as string[])).toBe(expected);
  });

  it('não lança com entradas estranhas', () => {
    expect(() => pickLocale([undefined as unknown as string, 'x'])).not.toThrow();
  });
});

describe('withHash', () => {
  it('acrescenta o hash quando existe', () => {
    expect(withHash('/en/', '#projetos')).toBe('/en/#projetos');
    expect(withHash('/en/', 'projetos')).toBe('/en/#projetos');
  });
  it('ignora hash vazio', () => {
    expect(withHash('/en/', '')).toBe('/en/');
    expect(withHash('/en/', '#')).toBe('/en/');
  });
});

describe('switchLocalePath', () => {
  it('troca home e projeto de idioma', () => {
    expect(switchLocalePath('/pt/', 'en')).toBe('/en/');
    expect(switchLocalePath('/en/', 'pt')).toBe('/pt/');
    expect(switchLocalePath('/pt/projetos/aurora/', 'en')).toBe('/en/projects/aurora/');
    expect(switchLocalePath('/en/projects/aurora/', 'pt')).toBe('/pt/projetos/aurora/');
  });
  it('lança em caminho sem idioma ou desconhecido', () => {
    expect(() => switchLocalePath('/', 'en')).toThrow(/locale/);
    expect(() => switchLocalePath('/pt/outra/coisa/', 'en')).toThrow(/cannot switch/);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- i18n`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar**

`src/lib/i18n.ts`:
```ts
export const LOCALES = ['pt', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'pt';

export const HTML_LANG: Record<Locale, string> = { pt: 'pt-BR', en: 'en' };

export const PROJECT_SEGMENT: Record<Locale, string> = { pt: 'projetos', en: 'projects' };

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt';
}

export function homePath(locale: Locale): string {
  return `/${locale}/`;
}

export function projectPath(locale: Locale, slug: string): string {
  return `/${locale}/${PROJECT_SEGMENT[locale]}/${slug}/`;
}

/** Primeiro idioma preferido que não esteja vazio: português vira 'pt', qualquer outro vira 'en'. */
export function pickLocale(languages: readonly string[]): Locale {
  const first = languages
    .map((l) => (typeof l === 'string' ? l.trim() : ''))
    .find((l) => l.length > 0);
  if (!first) return DEFAULT_LOCALE;
  return first.toLowerCase().split('-')[0] === 'pt' ? 'pt' : 'en';
}

export function withHash(path: string, hash: string): string {
  if (!hash || hash === '#') return path;
  return path + (hash.startsWith('#') ? hash : `#${hash}`);
}

export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  const from = parts[0];
  if (!isLocale(from)) throw new Error(`path has no locale prefix: ${pathname}`);
  if (parts.length === 1) return homePath(to);
  if (parts.length === 3 && parts[1] === PROJECT_SEGMENT[from]) return projectPath(to, parts[2]);
  throw new Error(`cannot switch locale for path: ${pathname}`);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test`
Expected: todos os testes PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add i18n core (routes, locale detection)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Conteúdo, projetos de exemplo e mídia de exemplo

**Files:**
- Create: `src/content/pt.json`, `src/content/en.json`, `src/content/site.ts`, `src/lib/copy.ts`
- Create: `src/lib/projects.ts`, `src/content/projects/{aurora,atlas,pulso,nimbus}.json`
- Create: `scripts/gen-mock-media.mjs` (e rodar para gerar `public/media/projects/**`)
- Test: `tests/unit/content.test.ts`, `tests/unit/projects.test.ts`

**Interfaces:**
- Consumes: `Locale` de `src/lib/i18n.ts`.
- Produces (exatos):
  - `copy: Record<Locale, Copy>` e `type Copy` (de `src/lib/copy.ts`). Chaves: `meta{title,description}`, `nav{about,services,projects,contact,menu,close,langAria}`, `hero{title,subtitle}`, `highlight{title,label}`, `about{label,text,skillsLabel,skills[],socialLabel}`, `services{title,explore,items[{title,text,href}]}`, `projects{title,view}`, `project{overview,role,next}`, `outro{title,text,cta,copied,copyFailed}`, `footer{emailLabel,locationLabel,location,navLabel,socialLabel,rights}`
  - `site` (de `src/content/site.ts`): `{ name, wordmark, email, example, socials: {id,label,short,url}[], highlightVideo: string | null }`
  - `interface ProjectText { title; caption; overview; role; shotCaptions: string[] }`
  - `interface Project { slug; order; year; example; tags: string[]; palette: [string,string,string]; cover; shots: string[]; video: string|null; link: string|null; pt: ProjectText; en: ProjectText }`
  - `parseProject(raw: unknown, file: string): Project`, `buildProjects(entries: Record<string, unknown>): Project[]`, `loadProjects(): Project[]`, `nextProject(projects: Project[], slug: string): Project | null`

- [ ] **Step 1: Escrever os testes que falham**

`tests/unit/projects.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { buildProjects, nextProject, parseProject } from '../../src/lib/projects';

const text = (t: string) => ({
  title: t, caption: `${t} caption`, overview: `${t} overview`, role: `${t} role`,
  shotCaptions: ['a', 'b'],
});
const base = (slug: string, order: number) => ({
  slug, order, year: 2026, example: true, tags: ['x'],
  palette: ['#000', '#111', '#222'], cover: `/c-${slug}.svg`, shots: ['/s1.svg', '/s2.svg'],
  video: null, link: null, pt: text('pt'), en: text('en'),
});

describe('parseProject', () => {
  it('aceita um projeto válido', () => {
    expect(parseProject(base('aurora', 1), 'aurora.json').slug).toBe('aurora');
  });

  it('falha citando arquivo e campo quando falta a tradução', () => {
    const raw: any = base('aurora', 1);
    delete raw.en.title;
    expect(() => parseProject(raw, 'aurora.json')).toThrow(/aurora\.json.*en\.title/);
  });

  it('falha quando o número de legendas não bate com o de imagens', () => {
    const raw: any = base('aurora', 1);
    raw.pt.shotCaptions = ['só uma'];
    expect(() => parseProject(raw, 'aurora.json')).toThrow(/pt\.shotCaptions/);
  });

  it('falha com slug que não é seguro para URL', () => {
    expect(() => parseProject(base('Meu Projeto!', 1), 'x.json')).toThrow(/slug/);
  });

  it('falha quando o slug não bate com o nome do arquivo', () => {
    expect(() => parseProject(base('aurora', 1), 'outro.json')).toThrow(/slug.*file name/i);
  });
});

describe('buildProjects', () => {
  it('ordena por order e rejeita slugs duplicados', () => {
    const list = buildProjects({ 'b.json': base('b', 2), 'a.json': base('a', 1) });
    expect(list.map((p) => p.slug)).toEqual(['a', 'b']);
    expect(() =>
      buildProjects({ 'a.json': base('a', 1), 'a2.json': { ...base('a', 2) } }),
    ).toThrow();
  });
});

describe('nextProject', () => {
  const list = buildProjects({ 'a.json': base('a', 1), 'b.json': base('b', 2), 'c.json': base('c', 3) });

  it('devolve o seguinte', () => {
    expect(nextProject(list, 'a')?.slug).toBe('b');
  });
  it('o último volta ao primeiro', () => {
    expect(nextProject(list, 'c')?.slug).toBe('a');
  });
  it('com um só projeto não há próximo', () => {
    expect(nextProject(list.slice(0, 1), 'a')).toBeNull();
  });
  it('slug desconhecido lança', () => {
    expect(() => nextProject(list, 'zzz')).toThrow(/zzz/);
  });
});
```

`tests/unit/content.test.ts`:
```ts
import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { loadProjects } from '../../src/lib/projects';

function leaves(value: unknown, prefix = ''): [string, unknown][] {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`));
  if (value && typeof value === 'object')
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  return [[prefix, value]];
}

describe('textos', () => {
  it('pt.json e en.json têm exatamente as mesmas chaves', () => {
    expect(leaves(pt).map(([k]) => k)).toEqual(leaves(en).map(([k]) => k));
  });

  it('nenhum texto está vazio', () => {
    for (const [lang, json] of [['pt', pt], ['en', en]] as const)
      for (const [key, value] of leaves(json))
        expect(typeof value === 'string' && value.trim().length > 0, `${lang}:${key}`).toBe(true);
  });
});

describe('projetos reais', () => {
  const projects = loadProjects();

  it('há de 3 a 4 projetos válidos', () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(projects.length).toBeLessThanOrEqual(4);
  });

  it('toda mídia referenciada existe em public/', () => {
    for (const p of projects)
      for (const file of [p.cover, ...p.shots])
        expect(existsSync(`public${file}`), `${p.slug}: ${file}`).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL (módulos e arquivos não existem).

- [ ] **Step 3: Implementar `src/lib/projects.ts`**

```ts
export interface ProjectText {
  title: string;
  caption: string;
  overview: string;
  role: string;
  shotCaptions: string[];
}

export interface Project {
  slug: string;
  order: number;
  year: number;
  example: boolean;
  tags: string[];
  palette: [string, string, string];
  cover: string;
  shots: string[];
  video: string | null;
  link: string | null;
  pt: ProjectText;
  en: ProjectText;
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function str(obj: any, key: string, file: string, ctx = ''): string {
  const value = obj?.[key];
  if (typeof value !== 'string' || !value.trim()) fail(file, `missing or empty "${ctx}${key}"`);
  return value;
}

function parseText(raw: any, locale: 'pt' | 'en', file: string, shots: number): ProjectText {
  const block = raw?.[locale];
  if (!block || typeof block !== 'object') fail(file, `missing "${locale}" block`);
  const captions = block.shotCaptions;
  if (
    !Array.isArray(captions) ||
    captions.length !== shots ||
    captions.some((c: unknown) => typeof c !== 'string' || !c.trim())
  )
    fail(file, `"${locale}.shotCaptions" must have ${shots} non-empty strings`);
  const ctx = `${locale}.`;
  return {
    title: str(block, 'title', file, ctx),
    caption: str(block, 'caption', file, ctx),
    overview: str(block, 'overview', file, ctx),
    role: str(block, 'role', file, ctx),
    shotCaptions: captions,
  };
}

export function parseProject(raw: unknown, file: string): Project {
  const r = raw as any;
  const slug = str(r, 'slug', file);
  if (!SLUG.test(slug)) fail(file, `slug "${slug}" is not URL-safe (use a-z, 0-9 and dashes)`);
  const baseName = file.split('/').pop()!.replace(/\.json$/, '');
  if (baseName !== slug) fail(file, `slug "${slug}" must match the file name "${baseName}"`);
  if (typeof r.order !== 'number') fail(file, 'missing numeric "order"');
  if (typeof r.year !== 'number') fail(file, 'missing numeric "year"');
  if (!Array.isArray(r.tags)) fail(file, 'missing "tags" array');
  if (!Array.isArray(r.palette) || r.palette.length !== 3) fail(file, '"palette" needs 3 colors');
  if (!Array.isArray(r.shots) || r.shots.length === 0) fail(file, 'missing "shots" array');
  return {
    slug,
    order: r.order,
    year: r.year,
    example: r.example === true,
    tags: r.tags,
    palette: r.palette as [string, string, string],
    cover: str(r, 'cover', file),
    shots: r.shots,
    video: typeof r.video === 'string' ? r.video : null,
    link: typeof r.link === 'string' ? r.link : null,
    pt: parseText(r, 'pt', file, r.shots.length),
    en: parseText(r, 'en', file, r.shots.length),
  };
}

export function buildProjects(entries: Record<string, unknown>): Project[] {
  const projects = Object.entries(entries).map(([file, raw]) => parseProject(raw, file));
  const seen = new Set<string>();
  for (const p of projects) {
    if (seen.has(p.slug)) throw new Error(`duplicate project slug "${p.slug}"`);
    seen.add(p.slug);
  }
  return projects.sort((a, b) => a.order - b.order);
}

export function loadProjects(): Project[] {
  const entries = import.meta.glob('../content/projects/*.json', { eager: true, import: 'default' });
  return buildProjects(entries as Record<string, unknown>);
}

export function nextProject(projects: Project[], slug: string): Project | null {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) throw new Error(`unknown project slug "${slug}"`);
  if (projects.length < 2) return null;
  return projects[(index + 1) % projects.length];
}
```

- [ ] **Step 4: Criar os textos, `site.ts` e `copy.ts`**

`src/content/site.ts`:
```ts
// EXEMPLO: troque e-mail e redes pelos seus e ponha `example` em false.
export const site = {
  name: 'Ivy Gabriel',
  wordmark: 'ivy',
  email: 'ola@example.com',
  example: true,
  socials: [
    { id: 'github', label: 'GitHub', short: 'GH', url: 'https://github.com/' },
    { id: 'linkedin', label: 'LinkedIn', short: 'IN', url: 'https://www.linkedin.com/' },
    { id: 'instagram', label: 'Instagram', short: 'IG', url: 'https://www.instagram.com/' },
  ],
  // Caminho de um vídeo curto (ex.: '/media/destaque.mp4') ou null para só o painel em código.
  highlightVideo: null as string | null,
};
```

`src/content/pt.json`:
```json
{
  "meta": {
    "title": "Ivy Gabriel — desenvolvimento e criação digital",
    "description": "Portfólio de Ivy Gabriel: sites, interfaces e experimentos feitos com código e cuidado com o detalhe."
  },
  "nav": {
    "about": "Sobre",
    "services": "Serviços",
    "projects": "Projetos",
    "contact": "Contato",
    "menu": "Abrir menu",
    "close": "Fechar menu",
    "langAria": "Mudar para inglês"
  },
  "hero": {
    "title": "Eu crio sites e produtos digitais que parecem vivos.",
    "subtitle": "Eu sou Ivy Gabriel. Desenvolvo interfaces, experimentos e projetos próprios, do código ao detalhe."
  },
  "highlight": {
    "title": "Código, movimento e detalhe.",
    "label": "Painel de destaque"
  },
  "about": {
    "label": "Sobre",
    "text": "Eu transformo ideias em interfaces rápidas, acessíveis e com personalidade. Gosto de começar pelo problema, desenhar com calma e só então escrever o código que o resolve.",
    "skillsLabel": "Habilidades",
    "skills": ["TypeScript", "JavaScript", "Astro", "GSAP", "CSS", "Node.js", "Figma", "Acessibilidade"],
    "socialLabel": "Redes"
  },
  "services": {
    "title": "Serviços",
    "explore": "Explorar",
    "items": [
      { "title": "Sites e experiências web", "text": "Eu construo sites rápidos e bem acabados, do primeiro rascunho ao deploy, com atenção a desempenho e acessibilidade.", "href": "#projetos" },
      { "title": "Interfaces interativas", "text": "Eu dou vida às interfaces com movimento, rolagem e microinterações que explicam em vez de enfeitar.", "href": "#projetos" },
      { "title": "Design de interfaces", "text": "Eu desenho telas e sistemas visuais consistentes, prontos para virar código sem surpresas.", "href": "#projetos" },
      { "title": "Protótipos e experimentos", "text": "Eu testo ideias rápido com protótipos funcionais, para decidir com algo na mão e não só no papel.", "href": "#projetos" }
    ]
  },
  "projects": {
    "title": "Projetos",
    "view": "Ver projeto"
  },
  "project": {
    "overview": "Visão geral",
    "role": "Meu papel",
    "next": "Próximo projeto"
  },
  "outro": {
    "title": "Tem uma ideia para tirar do papel?",
    "text": "Conte onde você está, o que quer alcançar e o que está no caminho. Eu respondo pessoalmente.",
    "cta": "Copiar e-mail",
    "copied": "Copiado!",
    "copyFailed": "Não consegui copiar. O e-mail é:"
  },
  "footer": {
    "emailLabel": "E-mail",
    "locationLabel": "Localização",
    "location": "Brasil",
    "navLabel": "Navegação",
    "socialLabel": "Redes",
    "rights": "© 2026 Ivy Gabriel"
  }
}
```

`src/content/en.json`:
```json
{
  "meta": {
    "title": "Ivy Gabriel — development and digital craft",
    "description": "Ivy Gabriel's portfolio: websites, interfaces and experiments built with code and care for detail."
  },
  "nav": {
    "about": "About",
    "services": "Services",
    "projects": "Projects",
    "contact": "Contact",
    "menu": "Open menu",
    "close": "Close menu",
    "langAria": "Switch to Portuguese"
  },
  "hero": {
    "title": "I build websites and digital products that feel alive.",
    "subtitle": "I'm Ivy Gabriel. I develop interfaces, experiments and personal projects, from code to detail."
  },
  "highlight": {
    "title": "Code, motion and detail.",
    "label": "Highlight panel"
  },
  "about": {
    "label": "About",
    "text": "I turn ideas into fast, accessible interfaces with personality. I like to start from the problem, design with patience and only then write the code that solves it.",
    "skillsLabel": "Skills",
    "skills": ["TypeScript", "JavaScript", "Astro", "GSAP", "CSS", "Node.js", "Figma", "Accessibility"],
    "socialLabel": "Social"
  },
  "services": {
    "title": "Services",
    "explore": "Explore",
    "items": [
      { "title": "Websites and web experiences", "text": "I build fast, polished websites from first draft to deploy, with attention to performance and accessibility.", "href": "#projetos" },
      { "title": "Interactive interfaces", "text": "I bring interfaces to life with motion, scroll and microinteractions that explain instead of decorate.", "href": "#projetos" },
      { "title": "Interface design", "text": "I design screens and consistent visual systems that are ready to become code without surprises.", "href": "#projetos" },
      { "title": "Prototypes and experiments", "text": "I test ideas fast with working prototypes, so decisions are made with something in hand and not only on paper.", "href": "#projetos" }
    ]
  },
  "projects": {
    "title": "Projects",
    "view": "View project"
  },
  "project": {
    "overview": "Overview",
    "role": "My role",
    "next": "Next project"
  },
  "outro": {
    "title": "Have an idea to take off the paper?",
    "text": "Tell me where you are, what you want to achieve and what is in the way. I reply personally.",
    "cta": "Copy email",
    "copied": "Copied!",
    "copyFailed": "I couldn't copy it. The email is:"
  },
  "footer": {
    "emailLabel": "Email",
    "locationLabel": "Location",
    "location": "Brazil",
    "navLabel": "Navigation",
    "socialLabel": "Social",
    "rights": "© 2026 Ivy Gabriel"
  }
}
```

`src/lib/copy.ts`:
```ts
import en from '../content/en.json';
import pt from '../content/pt.json';
import type { Locale } from './i18n';

export type Copy = typeof pt;

// A atribuição de `en` a `Copy` faz o TypeScript recusar um en.json com formato diferente do pt.json.
export const copy: Record<Locale, Copy> = { pt, en };
```

- [ ] **Step 5: Criar os 4 projetos de exemplo**

Cada arquivo `src/content/projects/<slug>.json` segue o mesmo formato. Crie os quatro:

`aurora.json`:
```json
{
  "slug": "aurora", "order": 1, "year": 2026, "example": true,
  "tags": ["Astro", "GSAP"],
  "palette": ["#4f46e5", "#a78bfa", "#fbbf24"],
  "cover": "/media/projects/aurora/cover.svg",
  "shots": ["/media/projects/aurora/shot-1.svg", "/media/projects/aurora/shot-2.svg", "/media/projects/aurora/shot-3.svg", "/media/projects/aurora/shot-4.svg"],
  "video": null, "link": null,
  "pt": {
    "title": "Aurora", "role": "Design e desenvolvimento",
    "caption": "Um site de lançamento que conta a história do produto rolando a página",
    "overview": "Eu desenhei e construí um site de lançamento em que cada seção revela uma parte da história do produto. O desafio era manter a página leve mesmo com muito movimento.",
    "shotCaptions": ["Hero com tipografia em movimento", "Seção de recursos com rolagem guiada", "Página de preços simples e clara", "Versão mobile pensada em primeiro lugar"]
  },
  "en": {
    "title": "Aurora", "role": "Design and development",
    "caption": "A launch site that tells the product story as you scroll",
    "overview": "I designed and built a launch site where each section reveals a piece of the product story. The challenge was keeping the page light despite the amount of motion.",
    "shotCaptions": ["Hero with moving typography", "Features section with guided scroll", "Simple, clear pricing page", "Mobile version designed first"]
  }
}
```

`atlas.json`:
```json
{
  "slug": "atlas", "order": 2, "year": 2026, "example": true,
  "tags": ["TypeScript", "Node.js"],
  "palette": ["#0ea5e9", "#14b8a6", "#f97316"],
  "cover": "/media/projects/atlas/cover.svg",
  "shots": ["/media/projects/atlas/shot-1.svg", "/media/projects/atlas/shot-2.svg", "/media/projects/atlas/shot-3.svg", "/media/projects/atlas/shot-4.svg"],
  "video": null, "link": null,
  "pt": {
    "title": "Atlas", "role": "Desenvolvimento",
    "caption": "Um painel de dados que deixa números complexos fáceis de entender",
    "overview": "Eu desenvolvi um painel que reúne várias fontes de dados em uma só visão. O foco foi leitura rápida: poucos elementos, hierarquia clara e filtros que respondem na hora.",
    "shotCaptions": ["Visão geral com indicadores principais", "Filtros que respondem na hora", "Detalhe de uma série com comparação", "Exportação em um clique"]
  },
  "en": {
    "title": "Atlas", "role": "Development",
    "caption": "A data dashboard that makes complex numbers easy to understand",
    "overview": "I developed a dashboard that brings several data sources into a single view. The focus was fast reading: few elements, clear hierarchy and filters that respond instantly.",
    "shotCaptions": ["Overview with key indicators", "Filters that respond instantly", "Series detail with comparison", "One-click export"]
  }
}
```

`pulso.json`:
```json
{
  "slug": "pulso", "order": 3, "year": 2025, "example": true,
  "tags": ["Design", "Prototype"],
  "palette": ["#ec4899", "#8b5cf6", "#22d3ee"],
  "cover": "/media/projects/pulso/cover.svg",
  "shots": ["/media/projects/pulso/shot-1.svg", "/media/projects/pulso/shot-2.svg", "/media/projects/pulso/shot-3.svg", "/media/projects/pulso/shot-4.svg"],
  "video": null, "link": null,
  "pt": {
    "title": "Pulso", "role": "Design e protótipo",
    "caption": "Um app de hábitos que recompensa a constância em vez da perfeição",
    "overview": "Eu desenhei e prototipei um app de hábitos. A ideia central: pequenas vitórias visíveis todos os dias, sem culpa quando um dia falha.",
    "shotCaptions": ["Tela inicial com o dia em um relance", "Registro de hábito em dois toques", "Histórico em calendário de calor", "Conquistas discretas, sem excesso"]
  },
  "en": {
    "title": "Pulso", "role": "Design and prototype",
    "caption": "A habits app that rewards consistency instead of perfection",
    "overview": "I designed and prototyped a habits app. The core idea: small visible wins every day, with no guilt when a day fails.",
    "shotCaptions": ["Home screen with the day at a glance", "Habit logging in two taps", "History as a heat calendar", "Quiet achievements, no excess"]
  }
}
```

`nimbus.json`:
```json
{
  "slug": "nimbus", "order": 4, "year": 2025, "example": true,
  "tags": ["Experiment", "WebGL"],
  "palette": ["#111827", "#6366f1", "#f472b6"],
  "cover": "/media/projects/nimbus/cover.svg",
  "shots": ["/media/projects/nimbus/shot-1.svg", "/media/projects/nimbus/shot-2.svg", "/media/projects/nimbus/shot-3.svg", "/media/projects/nimbus/shot-4.svg"],
  "video": null, "link": null,
  "pt": {
    "title": "Nimbus", "role": "Experimento pessoal",
    "caption": "Um experimento de partículas que reage ao cursor e ao ritmo da música",
    "overview": "Eu criei Nimbus para testar até onde o navegador vai com partículas e áudio. É um projeto pessoal, sem cliente, feito para aprender e brincar.",
    "shotCaptions": ["Nuvem de partículas em repouso", "Reação ao movimento do cursor", "Modo com áudio ligado", "Paletas que mudam com o tempo"]
  },
  "en": {
    "title": "Nimbus", "role": "Personal experiment",
    "caption": "A particle experiment that reacts to the cursor and the rhythm of the music",
    "overview": "I made Nimbus to test how far the browser goes with particles and audio. It's a personal project, with no client, made to learn and play.",
    "shotCaptions": ["Particle cloud at rest", "Reaction to cursor movement", "Audio-on mode", "Palettes that change over time"]
  }
}
```

- [ ] **Step 6: Gerar a mídia de exemplo**

`scripts/gen-mock-media.mjs`:
```js
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'src/content/projects';

function scene(w, h, [a, b, c], seed) {
  const rand = (n) => {
    seed = (seed * 9301 + 49297 + n * 233) % 233280;
    return seed / 233280;
  };
  const min = Math.min(w, h);
  const blobs = Array.from({ length: 5 }, (_, i) =>
    `<circle cx="${(rand(i) * w).toFixed(0)}" cy="${(rand(i + 9) * h).toFixed(0)}" r="${((0.12 + rand(i + 3) * 0.22) * min).toFixed(0)}" fill="${i % 2 ? b : c}" opacity=".55"/>`,
  ).join('');
  const bw = w * 0.62, bh = h * 0.5, bx = (w - bw) / 2, by = (h - bh) / 2;
  const line = (y, width, opacity, fill = '#000') =>
    `<rect x="${bx + bw * 0.06}" y="${by + bh * y}" width="${bw * width}" height="${bh * 0.05}" rx="${bh * 0.025}" fill="${fill}" opacity="${opacity}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<filter id="s"><feGaussianBlur stdDeviation="${(min * 0.05).toFixed(0)}"/></filter></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<g filter="url(#s)">${blobs}</g>
<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${bw * 0.04}" fill="#fff" opacity=".92"/>
<rect x="${bx + bw * 0.06}" y="${by + bh * 0.1}" width="${bw * 0.4}" height="${bh * 0.09}" rx="${bh * 0.045}" fill="${a}"/>
${line(0.3, 0.7, 0.14)}${line(0.42, 0.55, 0.1)}${line(0.54, 0.62, 0.1)}
<rect x="${bx + bw * 0.06}" y="${by + bh * 0.72}" width="${bw * 0.24}" height="${bh * 0.12}" rx="${bh * 0.06}" fill="#000"/>
</svg>`;
}

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const project = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'));
  const out = `public/media/projects/${project.slug}`;
  mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/cover.svg`, scene(1600, 1000, project.palette, 1));
  project.shots.forEach((_, i) => writeFileSync(`${out}/shot-${i + 1}.svg`, scene(1000, 1250, project.palette, i + 2)));
}
console.log('mock media generated');
```

Run: `node scripts/gen-mock-media.mjs`
Expected: imprime `mock media generated`; existem 5 SVGs por projeto em `public/media/projects/<slug>/`.

- [ ] **Step 7: Rodar os testes**

Run: `npm test`
Expected: PASS em todos (i18n, tokens, projects, content).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add content, example projects and mock media" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Layout base, rotas por idioma, SEO e sitemap

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Home.astro`, `src/pages/pt/index.astro`, `src/pages/en/index.astro`
- Modify: `src/pages/index.astro` (reescrever)
- Create: `public/favicon.svg`, `scripts/gen-og.mjs`, `public/og-cover.png` (gerado), `vitest.build.config.ts`, `tests/build/global-setup.ts`, `tests/build/dist.ts`
- Test: `tests/build/routes-seo.test.ts`

**Interfaces:**
- Consumes: `HTML_LANG`, `LOCALES`, `DEFAULT_LOCALE`, `homePath`, `pickLocale`, `withHash` (Task 2); `copy` (Task 3); `loadProjects`, `site` (Task 3).
- Produces: `Base.astro` com props `{ locale: Locale; title: string; description: string; alternates: Record<Locale,string>; image?: string }` e `<slot />`; `Home.astro` com prop `{ locale: Locale }`; helper de teste `read(path: string): string` e `exists(path: string): boolean` em `tests/build/dist.ts`.

- [ ] **Step 1: Infra de testes de build**

`vitest.build.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/build/**/*.test.ts'],
    globalSetup: ['tests/build/global-setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 240_000,
  },
});
```

`tests/build/global-setup.ts`:
```ts
import { execSync } from 'node:child_process';

export default function setup() {
  execSync('npm run build', { stdio: 'inherit' });
}
```

`tests/build/dist.ts`:
```ts
import { existsSync, readFileSync } from 'node:fs';

export const read = (path: string) => readFileSync(`dist/${path}`, 'utf8');
export const exists = (path: string) => existsSync(`dist/${path}`);
```

- [ ] **Step 2: Escrever o teste que falha**

`tests/build/routes-seo.test.ts`:
```ts
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
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `npm run test:build`
Expected: build conclui, mas os testes FALHAM (páginas não existem).

- [ ] **Step 4: Imagem OG e favicon**

`scripts/gen-og.mjs`:
```js
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<defs><radialGradient id="g" cx="50%" cy="115%" r="80%"><stop offset="0" stop-color="#4338ca" stop-opacity=".9"/><stop offset="1" stop-color="#000"/></radialGradient></defs>
<rect width="1200" height="630" fill="#000"/><rect width="1200" height="630" fill="url(#g)"/>
<text x="80" y="370" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="500" fill="#fff" letter-spacing="-2">Ivy Gabriel</text>
<text x="84" y="440" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#fff" fill-opacity=".7">Portfolio</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-cover.png');
console.log('og-cover.png generated');
```

Run: `node scripts/gen-og.mjs` e depois abra `public/og-cover.png` com a ferramenta Read para conferir que o texto aparece. Se o texto não renderizar (fonte ausente), troque `Helvetica, Arial` por uma fonte instalada.

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#000"/><text x="32" y="45" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="500" fill="#fff">i</text></svg>
```

- [ ] **Step 5: Layout base**

`src/layouts/Base.astro`:
```astro
---
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '../styles/tokens.css';
import '../styles/global.css';
import { ClientRouter } from 'astro:transitions';
import { site } from '../content/site';
import { DEFAULT_LOCALE, HTML_LANG, LOCALES, type Locale } from '../lib/i18n';
import { loadProjects } from '../lib/projects';

interface Props {
  locale: Locale;
  title: string;
  description: string;
  alternates: Record<Locale, string>;
  image?: string;
}

const { locale, title, description, alternates, image = '/og-cover.png' } = Astro.props;
const abs = (path: string) => new URL(path, Astro.site).href;
const hasExampleContent = site.example || loadProjects().some((p) => p.example);
---

<!doctype html>
<html lang={HTML_LANG[locale]}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={abs(alternates[locale])} />
    {LOCALES.map((l) => <link rel="alternate" hreflang={HTML_LANG[l]} href={abs(alternates[l])} />)}
    <link rel="alternate" hreflang="x-default" href={abs(alternates[DEFAULT_LOCALE])} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={abs(image)} />
    <meta property="og:url" content={abs(alternates[locale])} />
    <meta property="og:locale" content={HTML_LANG[locale].replace('-', '_')} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={abs(image)} />
    {hasExampleContent && <meta name="robots" content="noindex" />}
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 6: Home provisória, páginas por idioma e raiz**

`src/components/Home.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import { copy } from '../lib/copy';
import { homePath, type Locale } from '../lib/i18n';

interface Props { locale: Locale }
const { locale } = Astro.props;
const t = copy[locale];
const alternates = { pt: homePath('pt'), en: homePath('en') };
---

<Base locale={locale} title={t.meta.title} description={t.meta.description} alternates={alternates}>
  <main id="main">
    <h1>{t.hero.title}</h1>
  </main>
</Base>
```

`src/pages/pt/index.astro` e `src/pages/en/index.astro` (mudando só o `locale`):
```astro
---
import Home from '../../components/Home.astro';
---
<Home locale="pt" />
```
(`en/index.astro` usa `locale="en"`.)

`src/pages/index.astro` (substitui a provisória):
```astro
---
import '../styles/tokens.css';
import '../styles/global.css';
---

<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Ivy Gabriel</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="/pt/" />
    <noscript><meta http-equiv="refresh" content="0;url=/pt/" /></noscript>
  </head>
  <body class="container">
    <p><a href="/pt/">Português</a> · <a href="/en/">English</a></p>
    <script>
      import { homePath, pickLocale, withHash } from '../lib/i18n';
      const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
      location.replace(withHash(homePath(pickLocale([...languages])), location.hash));
    </script>
  </body>
</html>
```

- [ ] **Step 7: Rodar os testes de build**

Run: `npm run test:build`
Expected: PASS nos 6 testes.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add base layout, locale routes, SEO and sitemap" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Navbar, Hero, painel de destaque e Sobre (estático, com estilos)

**Files:**
- Create: `src/components/Pill.astro`, `Navbar.astro`, `Panel.astro`, `Hero.astro`, `Highlight.astro`, `About.astro`, `ShowreelModal.astro`
- Modify: `src/components/Home.astro`
- Test: `tests/build/home-top.test.ts`

**Interfaces:**
- Consumes: `copy`, `site` (Task 3); `homePath`, `otherLocale`, `HTML_LANG`, `switchLocalePath`-style paths (Task 2).
- Produces:
  - `Pill.astro`: props `{ href?: string; variant?: 'solid' | 'outline' | 'light'; class?: string }` + atributos extras; renderiza `<a>` se houver `href`, senão `<button>`.
  - `Navbar.astro`: props `{ locale: Locale; base?: string; switchHref: string }`. Classes que os scripts usam: `.Navbar`, `.logo__ch`, `.nav`, `.action`, `.toggle`, `[data-lang-switch]` com `data-base`.
  - `Panel.astro`: slot dentro de `.Preview > .container > .main[data-reveal="panel"] > .media`. Scripts usam `.Preview .main` e `.media`.
  - `Hero.astro`/`About.astro`: `h1`/`p` com `data-reveal="words"`; habilidades `li.Skill[data-reveal="scale"]`.
  - IDs de seção: `#destaque`, `#sobre`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/build/home-top.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { read } from './dist';

describe('topo da home', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: hero, destaque e sobre com habilidades', (lang, t) => {
    const html = read(`${lang}/index.html`);
    expect(html).toContain(t.hero.title);
    expect(html).toContain('id="destaque"');
    expect(html).toContain('id="sobre"');
    for (const skill of t.about.skills) expect(html).toContain(skill);
    expect(html).toContain('data-reveal="words"');
  });

  it('a navbar tem links por âncora, pílula de contato e troca de idioma', () => {
    const html = read('pt/index.html');
    expect(html).toContain('href="#sobre"');
    expect(html).toContain('href="#servicos"');
    expect(html).toContain('href="#projetos"');
    expect(html).toContain('href="#contato"');
    expect(html).toMatch(/data-lang-switch[^>]*href="\/en\/"|href="\/en\/"[^>]*data-lang-switch/);
  });

  it('o painel de destaque não carrega vídeo nem modal enquanto não houver vídeo', () => {
    const html = read('pt/index.html');
    expect(html).not.toContain('<dialog');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test:build`
Expected: FAIL (seções ainda não existem).

- [ ] **Step 3: `Pill.astro`**

```astro
---
interface Props {
  href?: string;
  variant?: 'solid' | 'outline' | 'light';
  class?: string;
  [attr: string]: unknown;
}
const { href, variant = 'solid', class: cls, ...rest } = Astro.props;
const Tag = href ? 'a' : 'button';
---

<Tag href={href} class:list={['Pill', `-${variant}`, cls]} {...rest}>
  <span class="Pill__label"><slot /></span>
</Tag>

<style>
  .Pill {
    --pill-bg: #000;
    --pill-fg: #fff;
    --pill-hover-bg: #fff;
    --pill-hover-fg: #000;
    --pill-border: #000;
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--pill-h);
    padding: 0 var(--pill-px);
    border: 1px solid var(--pill-border);
    border-radius: var(--r-pill);
    background: var(--pill-bg);
    color: var(--pill-fg);
    font-size: 2rem;
    font-weight: 500;
    white-space: nowrap;
    transition: color 0.4s;
  }
  .Pill::before {
    content: '';
    position: absolute;
    inset: -1px;
    z-index: -1;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    background: var(--pill-hover-bg);
    transform: translateY(101%);
    transition: transform 0.7s var(--ease-spring);
  }
  .Pill:hover,
  .Pill:focus-visible {
    color: var(--pill-hover-fg);
  }
  .Pill:hover::before,
  .Pill:focus-visible::before {
    transform: translateY(0);
  }
  .-outline {
    --pill-bg: transparent;
    --pill-fg: currentColor;
    --pill-hover-bg: #fff;
    --pill-hover-fg: #000;
    --pill-border: currentColor;
  }
  .-light {
    --pill-bg: #fff;
    --pill-fg: #000;
    --pill-hover-bg: #000;
    --pill-hover-fg: #fff;
    --pill-border: #fff;
  }
  @media (prefers-reduced-motion: reduce) {
    .Pill::before {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 4: `Navbar.astro`**

```astro
---
import { copy } from '../lib/copy';
import { site } from '../content/site';
import { HTML_LANG, homePath, otherLocale, type Locale } from '../lib/i18n';
import Pill from './Pill.astro';

interface Props {
  locale: Locale;
  base?: string;
  switchHref: string;
}
const { locale, base = '', switchHref } = Astro.props;
const t = copy[locale].nav;
const other = otherLocale(locale);
const links = [
  { href: `${base}#sobre`, label: t.about },
  { href: `${base}#servicos`, label: t.services },
  { href: `${base}#projetos`, label: t.projects },
];
---

<header class="Navbar">
  <div class="bar">
    <a class="logo" href={homePath(locale)} aria-label={site.name}>
      {[...site.wordmark].map((ch) => <span class="logo__ch">{ch}</span>)}
    </a>
    <button class="toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label={t.menu}>
      <span></span><span></span>
    </button>
    <nav id="menu" class="menu" aria-label={site.name}>
      <ul class="navs">
        {links.map((l) => <li><a class="nav" href={l.href}>{l.label}</a></li>)}
      </ul>
      <a
        class="lang action"
        href={switchHref}
        data-lang-switch
        data-base={switchHref}
        hreflang={HTML_LANG[other]}
        lang={HTML_LANG[other]}
        aria-label={t.langAria}>{other.toUpperCase()}</a
      >
      <Pill class="action" href={`${base}#contato`}>{t.contact}</Pill>
    </nav>
  </div>
</header>

<style>
  .Navbar {
    position: absolute;
    inset: 0 0 auto 0;
    z-index: 50;
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem var(--gutter);
  }
  .logo {
    display: inline-flex;
    font-size: 4rem;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .logo__ch {
    display: inline-block;
  }
  .menu {
    display: flex;
    align-items: center;
    gap: 3.6rem;
  }
  .navs {
    display: flex;
    gap: 3.6rem;
    font-size: 2rem;
  }
  .nav {
    position: relative;
    padding-block: 0.4rem;
  }
  .nav::after {
    content: '';
    position: absolute;
    inset: auto 0 0 0;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.6s var(--ease-out);
  }
  .nav:hover::after {
    transform: scaleX(1);
  }
  .lang {
    font-size: 2rem;
    font-weight: 500;
  }
  .toggle {
    display: none;
  }

  /* Estado fixo: some ao descer, volta ao subir (classes ligadas por navbar.ts) */
  .Navbar:global(.-fixed) {
    position: fixed;
    transform: translateY(-120%);
    transition: transform 0.6s var(--ease-out);
    background: rgb(255 255 255 / 0.88);
    backdrop-filter: blur(1.2rem);
  }
  .Navbar:global(.-fixed.-visible) {
    transform: none;
  }

  @media (max-width: 767px) {
    .bar {
      margin: 2rem;
      padding: 0 2.4rem;
      height: 6.4rem;
      border: 1px solid var(--c-line);
      border-radius: var(--r-pill);
      background: #fff;
    }
    .logo {
      font-size: 3.2rem;
    }
    .toggle {
      display: grid;
      gap: 0.8rem;
      width: 4rem;
      padding: 1rem 0.4rem;
    }
    .toggle span {
      height: 2px;
      background: currentColor;
      transition: transform 0.5s var(--ease-out);
    }
    .Navbar:global(.-open) .toggle span:first-child {
      transform: translateY(0.5rem) rotate(45deg);
    }
    .Navbar:global(.-open) .toggle span:last-child {
      transform: translateY(-0.5rem) rotate(-45deg);
    }
    .menu {
      position: fixed;
      inset: 0;
      z-index: -1;
      display: none;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 3rem;
      padding: 10rem 3rem 3rem;
      background: #fff;
    }
    .Navbar:global(.-open) .menu {
      display: flex;
    }
    .navs {
      flex-direction: column;
      gap: 2rem;
      font-size: 4.2rem;
    }
    .Navbar:global(.-fixed) {
      background: none;
      backdrop-filter: none;
    }
  }

  /* Sem JavaScript o menu do mobile fica sempre aberto em linha, para continuar navegável */
  :global(html:not(.js)) .toggle {
    display: none;
  }
  @media (max-width: 767px) {
    :global(html:not(.js)) .menu {
      position: static;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      padding: 1rem 0 0;
    }
    :global(html:not(.js)) .navs {
      flex-direction: row;
      font-size: 2rem;
    }
  }
</style>
```

- [ ] **Step 5: `Panel.astro`, `Highlight.astro`, `ShowreelModal.astro`**

`src/components/Panel.astro`:
```astro
---
interface Props { id?: string; label?: string; cursorIcon?: string }
const { id, label, cursorIcon } = Astro.props;
---

<section class="Preview" id={id} aria-label={label}>
  <div class="container">
    <div class="main" data-reveal="panel" data-cursor-icon={cursorIcon}>
      <div class="media"><slot /></div>
    </div>
  </div>
</section>

<style>
  .Preview {
    padding-bottom: 12rem;
  }
  .main {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    border-radius: var(--r-card);
    background: var(--c-lavender);
  }
  .media {
    position: absolute;
    inset: -10% 0;
  }
  .media :global(img),
  .media :global(video) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  @media (max-width: 767px) {
    .Preview {
      padding-bottom: 8rem;
    }
    .main {
      aspect-ratio: 4 / 5;
    }
  }
</style>
```

`src/components/Highlight.astro`:
```astro
---
import { copy } from '../lib/copy';
import { site } from '../content/site';
import type { Locale } from '../lib/i18n';
import Panel from './Panel.astro';
import ShowreelModal from './ShowreelModal.astro';

interface Props { locale: Locale }
const { locale } = Astro.props;
const t = copy[locale].highlight;
const video = site.highlightVideo;
---

<Panel id="destaque" label={t.label} cursorIcon={video ? 'play' : undefined}>
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <div class="blob b3"></div>
  <p class="statement">{t.title}</p>
</Panel>
{video && <ShowreelModal src={video} />}

<style>
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(6rem);
    opacity: 0.9;
  }
  .b1 { width: 60%; aspect-ratio: 1; left: -10%; top: 0; background: #c7d2fe; }
  .b2 { width: 50%; aspect-ratio: 1; right: -5%; top: 20%; background: #fde68a; }
  .b3 { width: 45%; aspect-ratio: 1; left: 30%; bottom: -20%; background: #fbcfe8; }
  :global(.motion) .blob {
    animation: drift 18s ease-in-out infinite alternate;
  }
  :global(.motion) .b2 { animation-duration: 22s; }
  :global(.motion) .b3 { animation-duration: 26s; }
  @keyframes drift {
    to { transform: translate3d(8%, -6%, 0) scale(1.15); }
  }
  .statement {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 0 6rem;
    text-align: center;
    font-size: var(--fs-h2);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
  }
</style>
```

`src/components/ShowreelModal.astro`:
```astro
---
interface Props { src: string }
const { src } = Astro.props;
---

<dialog class="ShowreelModal" id="showreel-modal" data-lenis-prevent data-cursor-icon="times">
  <video src={src} playsinline loop preload="none"></video>
</dialog>

<style>
  .ShowreelModal {
    width: min(100% - 4rem, 150rem);
    max-height: 90vh;
    padding: 0;
    border: 0;
    border-radius: var(--r-card);
    background: #000;
    overflow: hidden;
  }
  .ShowreelModal::backdrop {
    background: rgb(0 0 0 / 0.8);
  }
  video {
    width: 100%;
    height: auto;
  }
</style>
```

- [ ] **Step 6: `Hero.astro` e `About.astro`**

`src/components/Hero.astro`:
```astro
---
import { copy } from '../lib/copy';
import type { Locale } from '../lib/i18n';

interface Props { locale: Locale }
const t = copy[Astro.props.locale].hero;
---

<section class="Hero container">
  <h1 data-reveal="words">{t.title}</h1>
  <p data-reveal="words">{t.subtitle}</p>
</section>

<style>
  .Hero {
    padding-top: 20rem;
    padding-bottom: 8rem;
    text-align: center;
  }
  h1 {
    max-width: 90rem;
    margin: 0 auto;
    font-size: var(--fs-h1);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.01em;
  }
  p {
    max-width: 76rem;
    margin: 4rem auto 0;
    font-size: var(--fs-sub);
    line-height: 1.1;
  }
  @media (max-width: 767px) {
    .Hero {
      padding-top: 16rem;
      padding-bottom: 6rem;
      text-align: left;
    }
    h1,
    p {
      margin-inline: 0;
    }
    p {
      margin-top: 3rem;
    }
  }
</style>
```

`src/components/About.astro`:
```astro
---
import { copy } from '../lib/copy';
import { site } from '../content/site';
import type { Locale } from '../lib/i18n';

interface Props { locale: Locale }
const t = copy[Astro.props.locale].about;
---

<section class="About container--narrow" id="sobre">
  <div class="grid">
    <p class="label" data-reveal="fade">{t.label}</p>
    <p class="lead" data-reveal="words">{t.text}</p>
  </div>
  <div class="grid">
    <h2 class="label" data-reveal="fade">{t.skillsLabel}</h2>
    <ul class="skills">
      {t.skills.map((s) => <li class="Skill" data-reveal="scale">{s}</li>)}
    </ul>
  </div>
  <div class="grid">
    <h2 class="label" data-reveal="fade">{t.socialLabel}</h2>
    <ul class="socials">
      {site.socials.map((s) => (
        <li data-reveal="fade-up"><a href={s.url} rel="noopener" data-cursor-icon="arrow-up-right">{s.label} <span aria-hidden="true">↗</span></a></li>
      ))}
    </ul>
  </div>
</section>

<style>
  .About {
    display: grid;
    gap: 8rem;
    padding-block: 4rem 16rem;
  }
  .grid {
    display: grid;
    grid-template-columns: 28rem 1fr;
    gap: 2rem;
    align-items: start;
  }
  .lead {
    font-size: var(--fs-lead);
    line-height: 1.1;
  }
  .skills,
  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
  }
  .Skill {
    padding: 1.2rem 2.4rem;
    border: 1px solid var(--c-ink);
    border-radius: var(--r-pill);
    font-size: 2rem;
  }
  .socials a {
    display: inline-flex;
    gap: 0.6rem;
    font-size: 2.4rem;
    border-bottom: 1px solid currentColor;
  }
  @media (max-width: 767px) {
    .About {
      gap: 6rem;
      padding-bottom: 10rem;
    }
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 7: Compor na `Home.astro`**

Substitua `src/components/Home.astro` por:
```astro
---
import Base from '../layouts/Base.astro';
import { copy } from '../lib/copy';
import { homePath, otherLocale, type Locale } from '../lib/i18n';
import About from './About.astro';
import Hero from './Hero.astro';
import Highlight from './Highlight.astro';
import Navbar from './Navbar.astro';

interface Props { locale: Locale }
const { locale } = Astro.props;
const t = copy[locale];
const alternates = { pt: homePath('pt'), en: homePath('en') };
---

<Base locale={locale} title={t.meta.title} description={t.meta.description} alternates={alternates}>
  <Navbar locale={locale} switchHref={alternates[otherLocale(locale)]} />
  <main id="main">
    <Hero locale={locale} />
    <Highlight locale={locale} />
    <About locale={locale} />
  </main>
</Base>
```

- [ ] **Step 8: Rodar testes e olhar no navegador**

Run: `npm run test:build`
Expected: PASS.

Run: `npm run dev` (em segundo plano) e abra `http://localhost:4321/pt/` no desktop (1440px) e em mobile (390px) via DevTools. Confira: hero centralizado no desktop e à esquerda no mobile; painel de destaque com blobs animados; Sobre com habilidades em pílulas; barra de navegação com pílula "Contato". Pare o servidor ao terminar.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add navbar, hero, highlight panel and about sections" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Serviços, Projetos, Vamos conversar e footer (estático, com estilos)

**Files:**
- Create: `src/components/GradientArt.astro`, `Services.astro`, `Projects.astro`, `Outro.astro`, `Footer.astro`
- Modify: `src/components/Home.astro`
- Test: `tests/build/home-bottom.test.ts`

**Interfaces:**
- Consumes: `copy`, `site`, `loadProjects`, `projectPath` , `Pill` (Tasks 2, 3, 5).
- Produces:
  - `GradientArt.astro`: prop `{ variant: 'arch' | 'hex' | 'tri' }`.
  - `Services.astro`: `section.Services#servicos > .items > li.item` com filhos `.item__fill`, `.item__bg`, `.item__head` (`.item__title`, `.item__num`), `.item__accordion > .item__content`.
  - `Projects.astro`: `section.Projects.-inverse#projetos` com `a.Card[data-cursor-icon]` e, quando existir, `video`.
  - `Outro.astro`: `section.Outro#contato` com `button[data-clipboard-copy][data-copied][data-failed]`.
  - `Footer.astro`: props `{ locale: Locale; switchHref: string; base?: string }`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/build/home-bottom.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { site } from '../../src/content/site';
import { loadProjects } from '../../src/lib/projects';
import { read } from './dist';

describe('base da home', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: serviços vêm antes de projetos', (lang, t) => {
    const html = read(`${lang}/index.html`);
    const servicos = html.indexOf('id="servicos"');
    const projetos = html.indexOf('id="projetos"');
    expect(servicos).toBeGreaterThan(-1);
    expect(projetos).toBeGreaterThan(servicos);
    for (const item of t.services.items) expect(html).toContain(item.title);
  });

  it('lista todos os projetos, cada um apontando para a página do idioma', () => {
    const projects = loadProjects();
    const pt = read('pt/index.html');
    const en = read('en/index.html');
    for (const p of projects) {
      expect(pt).toContain(`href="/pt/projetos/${p.slug}/"`);
      expect(en).toContain(`href="/en/projects/${p.slug}/"`);
      expect(pt).toContain(p.pt.caption);
    }
  });

  it('o fechamento tem o botão de copiar e um link mailto como alternativa', () => {
    const html = read('pt/index.html');
    expect(html).toContain('id="contato"');
    expect(html).toContain(`data-clipboard-copy="${site.email}"`);
    expect(html).toContain(`href="mailto:${site.email}"`);
  });

  it('o footer tem e-mail, localização e redes', () => {
    const html = read('pt/index.html');
    expect(html).toContain('<footer');
    expect(html).toContain(pt.footer.location);
    for (const s of site.socials) expect(html).toContain(s.url);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test:build`
Expected: FAIL.

- [ ] **Step 3: `GradientArt.astro`**

```astro
---
interface Props { variant: 'arch' | 'hex' | 'tri' }
const { variant } = Astro.props;

const layers = [0, 1, 2, 3].map((i) => ({ w: 480 - i * 100, y: 40 + i * 70, r: 120 - i * 20 }));
const cx = 300;
const shape = (l: { w: number; y: number; r: number }) => {
  const x0 = cx - l.w / 2;
  const x1 = cx + l.w / 2;
  if (variant === 'arch')
    return { tag: 'path', d: `M${x0} 400V${l.y + l.r}a${l.r} ${l.r} 0 0 1 ${l.r} -${l.r}H${x1 - l.r}a${l.r} ${l.r} 0 0 1 ${l.r} ${l.r}V400z` };
  if (variant === 'hex')
    return { tag: 'polygon', points: `${x0},400 ${x0},${l.y + 60} ${cx},${l.y} ${x1},${l.y + 60} ${x1},400` };
  return { tag: 'polygon', points: `${x0},400 ${cx},${l.y} ${x1},400` };
};
---

<svg class="GradientArt" viewBox="0 0 600 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id={`art-${variant}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#818cf8" stop-opacity="0.45" />
      <stop offset="1" stop-color="#4338ca" stop-opacity="0.05" />
    </linearGradient>
  </defs>
  {layers.map((l) => {
    const s = shape(l);
    return s.tag === 'path'
      ? <path d={s.d} fill={`url(#art-${variant})`} stroke="rgb(255 255 255 / 0.16)" />
      : <polygon points={s.points} fill={`url(#art-${variant})`} stroke="rgb(255 255 255 / 0.16)" />;
  })}
</svg>

<style>
  .GradientArt {
    width: 100%;
    height: 100%;
  }
</style>
```

- [ ] **Step 4: `Services.astro`**

```astro
---
import { copy } from '../lib/copy';
import type { Locale } from '../lib/i18n';
import GradientArt from './GradientArt.astro';

interface Props { locale: Locale }
const t = copy[Astro.props.locale].services;
const variants = ['arch', 'hex', 'tri', 'arch'] as const;
---

<section class="Services" id="servicos">
  <div class="container--narrow head">
    <h2 data-reveal="words">{t.title}</h2>
  </div>
  <ol class="items container--narrow">
    {t.items.map((item, i) => (
      <li class="item">
        <div class="item__fill"></div>
        <div class="item__bg"><GradientArt variant={variants[i % variants.length]} /></div>
        <div class="item__head">
          <h3 class="item__title">{item.title}</h3>
          <span class="item__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        </div>
        <div class="item__accordion">
          <div class="item__inner">
            <div class="item__content">
              <p>{item.text}</p>
              <a class="item__link" href={item.href}>{t.explore} <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </li>
    ))}
  </ol>
</section>

<style>
  .Services {
    padding-bottom: 16rem;
  }
  .head {
    padding-bottom: 6rem;
  }
  h2 {
    font-size: var(--fs-h2);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .items {
    display: grid;
    gap: 1.2rem;
  }
  .item {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    padding: 5rem 5.4rem;
    border-radius: var(--r-card);
    color: #fff;
  }
  .item__fill {
    position: absolute;
    inset: 0;
    z-index: -2;
    background: #000;
  }
  .item__bg {
    position: absolute;
    inset: 0 0 0 40%;
    z-index: -1;
  }
  .item__head {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
  }
  .item__title {
    font-size: var(--fs-title);
    font-weight: 400;
    line-height: 1;
  }
  .item__num {
    font-size: var(--fs-title);
    line-height: 1;
    opacity: 0.5;
  }
  .item__accordion {
    display: grid;
    grid-template-rows: 1fr;
  }
  .item__inner {
    overflow: hidden;
  }
  .item__content {
    display: grid;
    gap: 3rem;
    max-width: 52rem;
    padding-top: 4rem;
    font-size: var(--fs-sub);
    line-height: 1.15;
  }
  .item__link {
    justify-self: start;
    border-bottom: 1px solid currentColor;
    font-size: 2rem;
  }

  /* Rolagem guiada (desktop): estado inicial claro e fechado; services.ts anima até o preto. */
  .Services:global(.is-scrub) .item:not(:first-child) {
    color: #000;
  }
  .Services:global(.is-scrub) .item:not(:first-child) .item__fill {
    background: var(--c-lavender);
  }
  .Services:global(.is-scrub) .item:not(:first-child) .item__bg {
    opacity: 0;
  }
  .Services:global(.is-scrub) .item:not(:first-child) .item__accordion {
    grid-template-rows: 0fr;
  }
  .Services:global(.is-scrub) .item:not(:first-child) .item__content {
    opacity: 0;
  }
  .Services:global(.is-scrub) .item:not(:first-child) .item__num {
    opacity: 0.3;
  }

  /* Acordeão por clique (mobile) */
  .Services:global(.is-accordion) .item {
    color: #000;
    cursor: pointer;
    transition: color 0.6s;
  }
  .Services:global(.is-accordion) .item__fill {
    background: var(--c-lavender);
    transition: background-color 0.6s;
  }
  .Services:global(.is-accordion) .item__bg {
    opacity: 0;
    transition: opacity 0.6s;
  }
  .Services:global(.is-accordion) .item__accordion {
    grid-template-rows: 0fr;
    transition: grid-template-rows 1.2s var(--ease-out);
  }
  .Services:global(.is-accordion) .item__content {
    opacity: 0;
    transition: opacity 0.6s;
  }
  .Services:global(.is-accordion) .item:global(.-active) {
    color: #fff;
  }
  .Services:global(.is-accordion) .item:global(.-active) .item__fill {
    background: #000;
  }
  .Services:global(.is-accordion) .item:global(.-active) .item__bg,
  .Services:global(.is-accordion) .item:global(.-active) .item__content {
    opacity: 1;
  }
  .Services:global(.is-accordion) .item:global(.-active) .item__accordion {
    grid-template-rows: 1fr;
  }

  @media (max-width: 767px) {
    .Services {
      padding-bottom: 10rem;
    }
    .item {
      padding: 3rem 2.4rem;
    }
    .item__bg {
      inset: 0;
    }
  }
</style>
```

- [ ] **Step 5: `Projects.astro`**

```astro
---
import { copy } from '../lib/copy';
import { projectPath, type Locale } from '../lib/i18n';
import { loadProjects } from '../lib/projects';

interface Props { locale: Locale }
const { locale } = Astro.props;
const t = copy[locale].projects;
const projects = loadProjects();
---

<section class="Projects -inverse" id="projetos">
  <div class="container--narrow head">
    <h2 data-reveal="words">{t.title}</h2>
  </div>
  <ul class="cards container--narrow">
    {projects.map((p) => (
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

<style>
  .Projects {
    padding-block: 14rem 16rem;
  }
  .head {
    padding-bottom: 10rem;
  }
  h2 {
    font-size: var(--fs-h2);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rem 10rem;
    align-items: start;
  }
  .cell:nth-child(even) {
    margin-top: 12rem;
  }
  .Card {
    display: block;
  }
  .Card__media {
    overflow: hidden;
    border-radius: var(--r-card);
    aspect-ratio: 4 / 5;
    background: #111;
  }
  .Card__media :global(img),
  .Card__media :global(video) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.8s var(--ease-out);
  }
  .Card:hover .Card__media :global(img),
  .Card:hover .Card__media :global(video) {
    transform: scale(0.96);
  }
  .Card__caption {
    max-width: 44rem;
    margin-top: 3rem;
    font-size: var(--fs-sub);
    line-height: 1.15;
  }
  @media (max-width: 767px) {
    .Projects {
      padding-block: 8rem 10rem;
    }
    .head {
      padding-bottom: 5rem;
    }
    .cards {
      grid-template-columns: 1fr;
      gap: 6rem;
    }
    .cell:nth-child(even) {
      margin-top: 0;
    }
  }
</style>
```

- [ ] **Step 6: `Outro.astro` e `Footer.astro`**

`src/components/Outro.astro`:
```astro
---
import { copy } from '../lib/copy';
import { site } from '../content/site';
import type { Locale } from '../lib/i18n';
import GradientArt from './GradientArt.astro';
import Pill from './Pill.astro';

interface Props { locale: Locale }
const t = copy[Astro.props.locale].outro;
---

<section class="Outro -inverse" id="contato">
  <div class="art"><GradientArt variant="tri" /></div>
  <div class="container inner">
    <h2 data-reveal="words">{t.title}</h2>
    <p data-reveal="words">{t.text}</p>
    <Pill
      variant="light"
      type="button"
      data-clipboard-copy={site.email}
      data-copied={t.copied}
      data-failed={t.copyFailed}
      data-cursor-icon="arrow-up-right">{t.cta}</Pill
    >
    <a class="mail" href={`mailto:${site.email}`}>{site.email}</a>
  </div>
</section>

<style>
  .Outro {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    padding-block: 18rem 16rem;
    text-align: center;
  }
  .art {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: radial-gradient(120% 90% at 50% 120%, #312e81 0%, #000 70%);
  }
  .inner {
    display: grid;
    justify-items: center;
    gap: 4rem;
  }
  h2 {
    max-width: 90rem;
    font-size: var(--fs-h1);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.01em;
  }
  p {
    max-width: 70rem;
    font-size: var(--fs-sub);
    line-height: 1.15;
  }
  .mail {
    font-size: 2rem;
    border-bottom: 1px solid currentColor;
  }
  @media (max-width: 767px) {
    .Outro {
      padding-block: 10rem 8rem;
      text-align: left;
    }
    .inner {
      justify-items: start;
    }
  }
</style>
```

`src/components/Footer.astro`:
```astro
---
import { copy } from '../lib/copy';
import { site } from '../content/site';
import { HTML_LANG, otherLocale, type Locale } from '../lib/i18n';

interface Props { locale: Locale; switchHref: string; base?: string }
const { locale, switchHref, base = '' } = Astro.props;
const t = copy[locale];
const other = otherLocale(locale);
const links = [
  { href: `${base}#sobre`, label: t.nav.about },
  { href: `${base}#servicos`, label: t.nav.services },
  { href: `${base}#projetos`, label: t.nav.projects },
  { href: `${base}#contato`, label: t.nav.contact },
];
---

<footer class="Footer -inverse">
  <div class="container grid">
    <div class="contact">
      <a class="pill" href={`mailto:${site.email}`} aria-label={t.footer.emailLabel}>{site.email}</a>
      <p class="loc"><span class="label">{t.footer.locationLabel}</span> {t.footer.location}</p>
    </div>
    <nav class="links" aria-label={t.footer.navLabel}>
      {links.map((l) => <a href={l.href}>{l.label}</a>)}
      <a
        href={switchHref}
        data-lang-switch
        data-base={switchHref}
        hreflang={HTML_LANG[other]}
        lang={HTML_LANG[other]}
        aria-label={t.nav.langAria}>{other.toUpperCase()}</a
      >
    </nav>
  </div>
  <div class="container bottom">
    <p class="rights">{t.footer.rights}</p>
    <ul class="socials" aria-label={t.footer.socialLabel}>
      {site.socials.map((s) => (
        <li><a class="circle" href={s.url} rel="noopener" aria-label={s.label} data-cursor-icon="arrow-up-right">{s.short}</a></li>
      ))}
    </ul>
  </div>
</footer>

<style>
  .Footer {
    padding-block: 8rem;
    border-top: 1px solid var(--c-line-inverse);
  }
  .grid {
    display: flex;
    justify-content: space-between;
    gap: 6rem;
  }
  .contact {
    display: grid;
    gap: 2rem;
    align-content: start;
  }
  .pill {
    justify-self: start;
    padding: 1.2rem 2.4rem;
    border: 1px solid #fff;
    border-radius: var(--r-pill);
    font-size: 2.4rem;
  }
  .loc {
    font-size: 1.6rem;
  }
  .loc .label {
    margin-right: 0.8rem;
    color: var(--c-paper-soft);
  }
  .links {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(3, auto);
    gap: 1.6rem 6rem;
    font-size: 2.4rem;
    text-align: right;
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8rem;
  }
  .rights {
    font-size: 1.6rem;
    color: var(--c-paper-soft);
  }
  .socials {
    display: flex;
    gap: 1.4rem;
  }
  .circle {
    display: grid;
    place-items: center;
    width: 5.4rem;
    height: 5.4rem;
    border-radius: 50%;
    background: rgb(255 255 255 / 0.12);
    font-size: 1.6rem;
    font-weight: 500;
    transition: background-color 0.4s;
  }
  .circle:hover {
    background: #fff;
    color: #000;
  }
  @media (max-width: 767px) {
    .Footer {
      padding-block: 6rem;
    }
    .grid {
      flex-direction: column;
      gap: 4rem;
    }
    .links {
      text-align: left;
      grid-template-rows: repeat(3, auto);
    }
    .bottom {
      flex-direction: column;
      align-items: flex-start;
      gap: 3rem;
      margin-top: 5rem;
    }
  }
</style>
```
- [ ] **Step 7: Compor na `Home.astro`**

Em `src/components/Home.astro`, adicione os imports e a ordem final das seções:
```astro
---
import Base from '../layouts/Base.astro';
import { copy } from '../lib/copy';
import { homePath, otherLocale, type Locale } from '../lib/i18n';
import About from './About.astro';
import Footer from './Footer.astro';
import Hero from './Hero.astro';
import Highlight from './Highlight.astro';
import Navbar from './Navbar.astro';
import Outro from './Outro.astro';
import Projects from './Projects.astro';
import Services from './Services.astro';

interface Props { locale: Locale }
const { locale } = Astro.props;
const t = copy[locale];
const alternates = { pt: homePath('pt'), en: homePath('en') };
const switchHref = alternates[otherLocale(locale)];
---

<Base locale={locale} title={t.meta.title} description={t.meta.description} alternates={alternates}>
  <Navbar locale={locale} switchHref={switchHref} />
  <main id="main">
    <Hero locale={locale} />
    <Highlight locale={locale} />
    <About locale={locale} />
    <Services locale={locale} />
    <Projects locale={locale} />
    <Outro locale={locale} />
  </main>
  <Footer locale={locale} switchHref={switchHref} />
</Base>
```

- [ ] **Step 8: Rodar testes e olhar no navegador**

Run: `npm run test:build`
Expected: PASS.

Run: `npm run dev` e confira `/pt/` rolando até o fim em 1440px e 390px: cartões pretos dos serviços (todos abertos, sem JS de movimento ainda), grade de projetos com colunas deslocadas, fechamento com gradiente, footer com pílula de e-mail e círculos sociais. Pare o servidor.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add services, projects, outro and footer sections" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Páginas de projeto

**Files:**
- Create: `src/components/ProjectPage.astro`, `src/pages/pt/projetos/[slug].astro`, `src/pages/en/projects/[slug].astro`
- Test: `tests/build/project-pages.test.ts`

**Interfaces:**
- Consumes: `Project`, `loadProjects`, `nextProject` (Task 3); `projectPath`, `homePath`, `otherLocale` (Task 2); `Navbar`, `Footer`, `Panel` (Tasks 5, 6).
- Produces: `ProjectPage.astro` com props `{ locale: Locale; project: Project; next: Project | null }`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/build/project-pages.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { loadProjects, nextProject } from '../../src/lib/projects';
import { exists, read } from './dist';

const projects = loadProjects();

describe('páginas de projeto', () => {
  it('existe uma página por projeto nos dois idiomas', () => {
    for (const p of projects) {
      expect(exists(`pt/projetos/${p.slug}/index.html`), `pt ${p.slug}`).toBe(true);
      expect(exists(`en/projects/${p.slug}/index.html`), `en ${p.slug}`).toBe(true);
    }
  });

  it('cada página tem título, visão geral, legendas e hreflang cruzado', () => {
    for (const p of projects) {
      const pt = read(`pt/projetos/${p.slug}/index.html`);
      expect(pt).toContain(p.pt.title);
      expect(pt).toContain(p.pt.overview);
      for (const c of p.pt.shotCaptions) expect(pt).toContain(c);
      expect(pt).toMatch(new RegExp(`hreflang="en" href="[^"]*/en/projects/${p.slug}/"`));
      const en = read(`en/projects/${p.slug}/index.html`);
      expect(en).toContain(p.en.title);
      expect(en).toMatch(new RegExp(`hreflang="pt-BR" href="[^"]*/pt/projetos/${p.slug}/"`));
    }
  });

  it('o próximo projeto do último volta ao primeiro', () => {
    const last = projects[projects.length - 1];
    const first = projects[0];
    expect(nextProject(projects, last.slug)?.slug).toBe(first.slug);
    expect(read(`pt/projetos/${last.slug}/index.html`)).toContain(`href="/pt/projetos/${first.slug}/"`);
  });

  it('os links da navbar voltam para as âncoras da home do idioma', () => {
    const html = read(`pt/projetos/${projects[0].slug}/index.html`);
    expect(html).toContain('href="/pt/#projetos"');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm run test:build`
Expected: FAIL (páginas não existem).

- [ ] **Step 3: `ProjectPage.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { copy } from '../lib/copy';
import { homePath, otherLocale, projectPath, type Locale } from '../lib/i18n';
import type { Project } from '../lib/projects';
import Footer from './Footer.astro';
import Navbar from './Navbar.astro';
import Panel from './Panel.astro';

interface Props { locale: Locale; project: Project; next: Project | null }
const { locale, project, next } = Astro.props;
const t = copy[locale];
const tx = project[locale];
const alternates = {
  pt: projectPath('pt', project.slug),
  en: projectPath('en', project.slug),
};
const switchHref = alternates[otherLocale(locale)];
---

<Base locale={locale} title={`${tx.title} — ${t.meta.title}`} description={tx.caption} alternates={alternates}>
  <Navbar locale={locale} base={homePath(locale)} switchHref={switchHref} />
  <main id="main">
    <section class="Tophead container">
      <p class="label" data-reveal="fade">{project.year} · {project.tags.join(' · ')}</p>
      <h1 data-reveal="words">{tx.title}</h1>
    </section>

    <Panel label={tx.title}>
      <img src={project.cover} alt={tx.title} width="1600" height="1000" />
    </Panel>

    <section class="Overview container--narrow">
      <p class="label" data-reveal="fade">{t.project.overview}</p>
      <div>
        <p class="lead" data-reveal="words">{tx.overview}</p>
        <p class="role" data-reveal="fade-up"><span class="label">{t.project.role}</span> {tx.role}</p>
      </div>
    </section>

    <section class="Splitshow container--narrow">
      <ul class="shots">
        {project.shots.map((src, i) => (
          <li class="shot">
            <div class="shot__media"><img src={src} alt="" width="1000" height="1250" loading="lazy" /></div>
            <p class="shot__caption" data-reveal="fade-up">{tx.shotCaptions[i]}</p>
          </li>
        ))}
      </ul>
    </section>

    {next && (
      <section class="Next -inverse">
        <a class="container link" href={projectPath(locale, next.slug)} data-cursor-icon="arrow-up-right">
          <span class="label">{t.project.next}</span>
          <span class="title">{next[locale].title}</span>
        </a>
      </section>
    )}
  </main>
  <Footer locale={locale} base={homePath(locale)} switchHref={switchHref} />
</Base>

<style>
  .Tophead {
    padding-top: 20rem;
    padding-bottom: 8rem;
  }
  .Tophead h1 {
    margin-top: 2rem;
    max-width: 90rem;
    font-size: var(--fs-h1);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.01em;
  }
  .Overview {
    display: grid;
    grid-template-columns: 28rem 1fr;
    gap: 2rem;
    padding-bottom: 14rem;
  }
  .lead {
    font-size: var(--fs-lead);
    line-height: 1.1;
  }
  .role {
    margin-top: 4rem;
    font-size: 2rem;
  }
  .role .label {
    margin-right: 1rem;
    color: var(--c-ink-soft);
  }
  .Splitshow {
    padding-bottom: 16rem;
  }
  .shots {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10rem 10rem;
    align-items: start;
  }
  .shot:nth-child(even) {
    margin-top: 12rem;
  }
  .shot__media {
    overflow: hidden;
    border-radius: var(--r-card);
    aspect-ratio: 4 / 5;
    background: var(--c-lavender);
  }
  .shot__media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .shot__caption {
    max-width: 44rem;
    margin-top: 3rem;
    font-size: var(--fs-sub);
    line-height: 1.15;
  }
  .Next {
    padding-block: 14rem;
  }
  .link {
    display: grid;
    gap: 2rem;
  }
  .link .title {
    font-size: var(--fs-h2);
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  @media (max-width: 767px) {
    .Tophead {
      padding-top: 16rem;
      padding-bottom: 5rem;
    }
    .Overview {
      grid-template-columns: 1fr;
      padding-bottom: 8rem;
    }
    .Splitshow {
      padding-bottom: 8rem;
    }
    .shots {
      grid-template-columns: 1fr;
      gap: 6rem;
    }
    .shot:nth-child(even) {
      margin-top: 0;
    }
    .Next {
      padding-block: 8rem;
    }
  }
</style>
```

- [ ] **Step 4: As duas páginas dinâmicas**

`src/pages/pt/projetos/[slug].astro`:
```astro
---
import ProjectPage from '../../../components/ProjectPage.astro';
import { loadProjects, nextProject } from '../../../lib/projects';

export function getStaticPaths() {
  const projects = loadProjects();
  return projects.map((project) => ({
    params: { slug: project.slug },
    props: { project, next: nextProject(projects, project.slug) },
  }));
}

const { project, next } = Astro.props;
---
<ProjectPage locale="pt" project={project} next={next} />
```

`src/pages/en/projects/[slug].astro`: igual, com os imports idênticos (mesma profundidade de pasta) e `locale="en"`.

- [ ] **Step 5: Rodar testes**

Run: `npm run test:build`
Expected: PASS (inclusive os testes anteriores).

- [ ] **Step 6: Olhar no navegador**

Run: `npm run dev`, abra `/pt/projetos/aurora/` e `/en/projects/nimbus/`. Confira o topo, o painel com a capa, a visão geral, a grade de imagens com legendas e o bloco "Próximo projeto". Pare o servidor.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add project pages in both languages" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Fundação de movimento (flags, registro, Lenis, ciclo com ClientRouter)

**Files:**
- Create: `src/lib/capabilities.ts`, `src/scripts/gsap.ts`, `src/scripts/registry.ts`, `src/scripts/motion-config.ts`, `src/scripts/smooth-scroll.ts`, `src/scripts/main.ts`
- Modify: `src/layouts/Base.astro`, `src/styles/global.css`
- Test: `tests/unit/capabilities.test.ts`, `tests/unit/registry.test.ts`, `tests/unit/motion-config.test.ts`, `tests/build/no-js-safe.test.ts`

**Interfaces:**
- Consumes: nada de tasks anteriores além do layout.
- Produces (exatos):
  - `interface Env { reducedMotion: boolean; finePointer: boolean; touch: boolean }`
  - `interface MotionFlags { animations: boolean; smoothScroll: boolean; cursor: boolean }`
  - `readEnv(win: { matchMedia(q: string): { matches: boolean } }): Env`, `motionFlags(env: Env): MotionFlags`
  - `register(init: Init)`, `mount(root: ParentNode, flags: MotionFlags)`, `unmount()`; `type Init = (root: ParentNode, flags: MotionFlags) => void | (() => void)`
  - `MOTION` (constantes de `motion-config.ts`)
  - `gsap`, `ScrollTrigger`, `SplitText` reexportados de `src/scripts/gsap.ts`
  - `getLenis(): Lenis | null`

- [ ] **Step 1: Escrever os testes que falham**

`tests/unit/capabilities.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { motionFlags, readEnv } from '../../src/lib/capabilities';

const win = (matches: Record<string, boolean>) => ({
  matchMedia: (query: string) => ({ matches: !!matches[query] }),
});

describe('readEnv', () => {
  it('lê as três media queries', () => {
    const env = readEnv(win({ '(pointer: fine)': true }));
    expect(env).toEqual({ reducedMotion: false, finePointer: true, touch: false });
  });
});

describe('motionFlags', () => {
  it('liga tudo no desktop com mouse', () => {
    expect(motionFlags({ reducedMotion: false, finePointer: true, touch: false })).toEqual({
      animations: true, smoothScroll: true, cursor: true,
    });
  });

  it('desliga tudo com prefers-reduced-motion, mesmo com mouse', () => {
    expect(motionFlags({ reducedMotion: true, finePointer: true, touch: false })).toEqual({
      animations: false, smoothScroll: false, cursor: false,
    });
  });

  it('no toque mantém animações, mas sem Lenis nem cursor', () => {
    expect(motionFlags({ reducedMotion: false, finePointer: false, touch: true })).toEqual({
      animations: true, smoothScroll: false, cursor: false,
    });
  });

  it('sem ponteiro fino nem grosso: Lenis sim, cursor não', () => {
    expect(motionFlags({ reducedMotion: false, finePointer: false, touch: false })).toEqual({
      animations: true, smoothScroll: true, cursor: false,
    });
  });
});
```

`tests/unit/registry.test.ts`:
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

const flags = { animations: true, smoothScroll: true, cursor: true };

describe('registry', () => {
  beforeEach(() => vi.resetModules());

  it('monta todas as inicializações com a raiz e as flags', async () => {
    const { register, mount } = await import('../../src/scripts/registry');
    const a = vi.fn();
    const b = vi.fn();
    register(a);
    register(b);
    const root = {} as ParentNode;
    mount(root, flags);
    expect(a).toHaveBeenCalledWith(root, flags);
    expect(b).toHaveBeenCalledWith(root, flags);
  });

  it('montar de novo roda o cleanup da montagem anterior (sem duplicar)', async () => {
    const { register, mount } = await import('../../src/scripts/registry');
    const cleanup = vi.fn();
    const init = vi.fn(() => cleanup);
    register(init);
    mount({} as ParentNode, flags);
    mount({} as ParentNode, flags);
    expect(init).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('um cleanup que falha não impede os outros nem lança', async () => {
    const { register, mount, unmount } = await import('../../src/scripts/registry');
    const ok = vi.fn();
    register(() => ok);
    register(() => () => {
      throw new Error('boom');
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    mount({} as ParentNode, flags);
    expect(() => unmount()).not.toThrow();
    expect(ok).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalled();
  });

  it('uma inicialização que falha não derruba as demais', async () => {
    const { register, mount } = await import('../../src/scripts/registry');
    const later = vi.fn();
    register(() => {
      throw new Error('init failed');
    });
    register(later);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => mount({} as ParentNode, flags)).not.toThrow();
    expect(later).toHaveBeenCalled();
  });

  it('unmount é idempotente', async () => {
    const { register, mount, unmount } = await import('../../src/scripts/registry');
    const cleanup = vi.fn();
    register(() => cleanup);
    mount({} as ParentNode, flags);
    unmount();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
```

`tests/unit/motion-config.test.ts` (fixa os valores medidos no Cuberto, para ninguém mudar sem querer):
```ts
import { describe, expect, it } from 'vitest';
import { MOTION } from '../../src/scripts/motion-config';

describe('MOTION (valores medidos na análise do Cuberto)', () => {
  it('revelação de palavras', () => {
    expect(MOTION.words).toEqual({ duration: 1.7, staggerAmount: 0.6, ease: 'expo.out', fromY: '120%' });
  });
  it('subida com fade', () => {
    expect(MOTION.fadeUp).toEqual({ fromY: 70, duration: 2, opacityDuration: 1, stagger: 0.1, ease: 'expo.out' });
  });
  it('escala e fade simples', () => {
    expect(MOTION.scale).toEqual({ from: 0, duration: 2, stagger: 0.1, ease: 'expo.out' });
    expect(MOTION.fade).toEqual({ duration: 2, stagger: 0.1, ease: 'expo.out' });
  });
  it('painel de destaque', () => {
    expect(MOTION.panel).toEqual({
      from: 'inset(5% 10% round 2rem)', to: 'inset(0% 0% round 2rem)',
      scale: 0.9, duration: 2.5, ease: 'expo.out', opacityDuration: 1,
    });
    expect(MOTION.parallax).toEqual({ from: '-10%', to: '10%', scale: 1.05 });
  });
  it('transição de página, navbar, cursor e serviços', () => {
    expect(MOTION.loader).toEqual({ duration: 0.7, ease: 'power4.inOut', hideDuration: 0.4 });
    expect(MOTION.navbar).toEqual({ logoStagger: 0.06, logoDuration: 0.4, itemY: 20, itemStagger: 0.1, itemDuration: 0.8 });
    expect(MOTION.cursor).toEqual({ speed: 0.5, skewing: 1.5 });
    expect(MOTION.services).toEqual({ scrub: 1, startOffset: '20%', endOffset: '30%' });
  });
});
```

`tests/build/no-js-safe.test.ts`:
```ts
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { read } from './dist';

function allCss(): string {
  const dir = 'dist/_astro';
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`${dir}/${f}`, 'utf8'))
    .join('\n');
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
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test && npm run test:build`
Expected: FAIL (módulos e regras não existem).

- [ ] **Step 3: `capabilities.ts`**

```ts
export interface Env {
  reducedMotion: boolean;
  finePointer: boolean;
  touch: boolean;
}

export interface MotionFlags {
  animations: boolean;
  smoothScroll: boolean;
  cursor: boolean;
}

export function readEnv(win: { matchMedia(query: string): { matches: boolean } }): Env {
  const matches = (query: string) => win.matchMedia(query).matches;
  return {
    reducedMotion: matches('(prefers-reduced-motion: reduce)'),
    finePointer: matches('(pointer: fine)'),
    touch: matches('(pointer: coarse)'),
  };
}

export function motionFlags(env: Env): MotionFlags {
  const animations = !env.reducedMotion;
  return {
    animations,
    smoothScroll: animations && !env.touch,
    cursor: animations && env.finePointer && !env.touch,
  };
}
```

- [ ] **Step 4: `registry.ts`, `motion-config.ts`, `gsap.ts`**

`src/scripts/registry.ts`:
```ts
import type { MotionFlags } from '../lib/capabilities';

type Cleanup = void | (() => void);
export type Init = (root: ParentNode, flags: MotionFlags) => Cleanup;

const inits: Init[] = [];
let cleanups: (() => void)[] = [];

export function register(init: Init): void {
  inits.push(init);
}

export function unmount(): void {
  const pending = cleanups;
  cleanups = [];
  for (const cleanup of pending.reverse()) {
    try {
      cleanup();
    } catch (error) {
      console.error('[motion] cleanup failed', error);
    }
  }
}

export function mount(root: ParentNode, flags: MotionFlags): void {
  unmount();
  for (const init of inits) {
    try {
      const cleanup = init(root, flags);
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    } catch (error) {
      console.error('[motion] init failed', error);
    }
  }
}
```

`src/scripts/motion-config.ts`:
```ts
// Valores medidos no CSS/JS público do Cuberto (ver spec, "Animações e interações").
export const MOTION = {
  words: { duration: 1.7, staggerAmount: 0.6, ease: 'expo.out', fromY: '120%' },
  fadeUp: { fromY: 70, duration: 2, opacityDuration: 1, stagger: 0.1, ease: 'expo.out' },
  fade: { duration: 2, stagger: 0.1, ease: 'expo.out' },
  scale: { from: 0, duration: 2, stagger: 0.1, ease: 'expo.out' },
  panel: {
    from: 'inset(5% 10% round 2rem)',
    to: 'inset(0% 0% round 2rem)',
    scale: 0.9,
    duration: 2.5,
    ease: 'expo.out',
    opacityDuration: 1,
  },
  parallax: { from: '-10%', to: '10%', scale: 1.05 },
  loader: { duration: 0.7, ease: 'power4.inOut', hideDuration: 0.4 },
  navbar: { logoStagger: 0.06, logoDuration: 0.4, itemY: 20, itemStagger: 0.1, itemDuration: 0.8 },
  cursor: { speed: 0.5, skewing: 1.5 },
  services: { scrub: 1, startOffset: '20%', endOffset: '30%' },
} as const;
```

`src/scripts/gsap.ts`:
```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
```

- [ ] **Step 5: Lenis e `main.ts`**

`src/scripts/smooth-scroll.ts`:
```ts
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './gsap';
import { register } from './registry';

let current: Lenis | null = null;
export const getLenis = (): Lenis | null => current;

register((_root, flags) => {
  if (!flags.smoothScroll) return;

  const lenis = new Lenis();
  current = lenis;
  lenis.on('scroll', ScrollTrigger.update);

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]');
    if (!link || link.origin !== location.origin || link.pathname !== location.pathname) return;
    if (link.hash.length < 2) return;
    const target = document.querySelector<HTMLElement>(link.hash);
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { duration: 1.4 });
  };
  document.addEventListener('click', onClick);

  return () => {
    document.removeEventListener('click', onClick);
    gsap.ticker.remove(tick);
    lenis.destroy();
    current = null;
  };
});
```

`src/scripts/main.ts`:
```ts
import { motionFlags, readEnv } from '../lib/capabilities';
import { gsap, ScrollTrigger } from './gsap';
import { mount, unmount } from './registry';
import './smooth-scroll';

interface SwapEvent extends Event {
  newDocument: Document;
}

const ROOT_CLASSES = ['js', 'motion', 'motion-failed'];
let context: gsap.Context | null = null;

function start() {
  const flags = motionFlags(readEnv(window));
  document.documentElement.classList.toggle('motion', flags.animations);
  context = gsap.context(() => mount(document, flags));
  (window as unknown as { __motionReady: boolean }).__motionReady = true;
  ScrollTrigger.refresh();
}

function stop() {
  unmount();
  context?.revert();
  context = null;
}

// O ClientRouter troca os atributos do <html>; sem isto as classes js/motion sumiriam.
document.addEventListener('astro:before-swap', (event) => {
  stop();
  const next = (event as SwapEvent).newDocument.documentElement;
  for (const name of ROOT_CLASSES)
    if (document.documentElement.classList.contains(name)) next.classList.add(name);
});

document.addEventListener('astro:page-load', start);
```

- [ ] **Step 6: Ligar no layout e nos estilos**

Em `src/layouts/Base.astro`, dentro de `<head>`, antes de `<ClientRouter />`, adicione o script de bootstrap; e antes de `</body>`, o módulo principal:
```astro
    <script is:inline>
      (function () {
        var root = document.documentElement;
        root.classList.add('js');
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduced) {
          root.classList.add('motion');
          setTimeout(function () {
            if (!window.__motionReady) root.classList.add('motion-failed');
          }, 4000);
        }
      })();
    </script>
```
```astro
    <slot />
    <script>
      import '../scripts/main';
    </script>
```

Acrescente ao fim de `src/styles/global.css`:
```css
/* Estados iniciais de revelação: só existem quando o JS ligou o movimento (.motion)
   e somem se o script falhar (.motion-failed). */
.motion:not(.motion-failed) [data-reveal]:not([data-revealed]) {
  opacity: 0;
}
```

- [ ] **Step 7: Rodar testes**

Run: `npm test && npm run test:build`
Expected: PASS em tudo.

- [ ] **Step 8: Verificar no navegador**

Run: `npm run dev`; abra `/pt/`, role a página: a rolagem deve ser suave (Lenis) e o console sem erros. Ative "Emular prefers-reduced-motion: reduce" nas DevTools e recarregue: rolagem nativa, conteúdo todo visível. Pare o servidor.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add motion foundation (flags, registry, Lenis, router lifecycle)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Revelações de texto e elementos

**Files:**
- Create: `src/scripts/reveal.ts`
- Modify: `src/scripts/main.ts` (importar `./reveal`)

**Interfaces:**
- Consumes: `register`, `gsap`, `ScrollTrigger`, `SplitText`, `MOTION` (Task 8). Marcação `data-reveal="words|fade-up|fade|scale|panel"` (Tasks 5–7).
- Produces: comportamento; marca cada elemento tratado com `data-revealed="1"` (isso tira o `opacity: 0` do CSS).

- [ ] **Step 1: Implementar `reveal.ts`**

```ts
import { MOTION } from './motion-config';
import { gsap, ScrollTrigger, SplitText } from './gsap';
import { register } from './registry';

const HEADING = /^H[1-6]$/;

function revealWords(el: HTMLElement) {
  const { duration, staggerAmount, ease, fromY } = MOTION.words;
  const split = SplitText.create(el, {
    type: 'words',
    mask: 'words',
    aria: HEADING.test(el.tagName) ? 'auto' : 'none',
  });
  // Folga em volta de cada palavra para a máscara não cortar ascendentes e descendentes.
  gsap.set(split.masks, { display: 'inline-block', margin: '-0.2em', verticalAlign: 'top' });
  gsap.set(split.words, { display: 'inline-block', padding: '0.2em', y: fromY });
  const tl = gsap.timeline({ paused: true });
  tl.set(split.words, { willChange: 'transform' }, 0);
  tl.to(split.words, { y: '0%', duration, stagger: { amount: staggerAmount }, ease }, 0);
  tl.set(split.words, { willChange: 'auto' });
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => tl.play() });
}

function batchFadeUp(els: HTMLElement[]) {
  if (!els.length) return;
  const { fromY, duration, opacityDuration, stagger, ease } = MOTION.fadeUp;
  gsap.set(els, { opacity: 0, y: fromY });
  ScrollTrigger.batch(els, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      const tl = gsap.timeline();
      tl.set(batch, { willChange: 'transform' }, 0);
      tl.to(batch, { opacity: 1, duration: opacityDuration, stagger }, 0);
      tl.to(batch, { y: 0, duration, stagger, ease }, 0);
      tl.set(batch, { willChange: 'auto' });
    },
  });
}

function batchFade(els: HTMLElement[]) {
  if (!els.length) return;
  const { duration, stagger, ease } = MOTION.fade;
  gsap.set(els, { opacity: 0 });
  ScrollTrigger.batch(els, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, duration, stagger, ease }),
  });
}

function batchScale(els: HTMLElement[]) {
  if (!els.length) return;
  const { from, duration, stagger, ease } = MOTION.scale;
  gsap.set(els, { scale: from });
  ScrollTrigger.batch(els, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      const tl = gsap.timeline();
      tl.set(batch, { willChange: 'transform' }, 0);
      tl.to(batch, { scale: 1, duration, stagger, ease }, 0);
      tl.set(batch, { willChange: 'auto' });
    },
  });
}

function revealPanel(el: HTMLElement) {
  const p = MOTION.panel;
  gsap.set(el, { opacity: 0 });
  const tl = gsap.timeline({ paused: true });
  tl.set(el, { willChange: 'transform' }, 0);
  tl.fromTo(el, { clipPath: p.from, scale: p.scale }, { clipPath: p.to, scale: 1, duration: p.duration, ease: p.ease }, 0.1);
  tl.to(el, { opacity: 1, duration: p.opacityDuration }, 0.1);
  tl.set(el, { willChange: 'auto' });
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => tl.play() });
}

register((root, flags) => {
  if (!flags.animations) return;
  const els = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const of = (kind: string) => els.filter((el) => el.dataset.reveal === kind);

  of('words').forEach(revealWords);
  of('panel').forEach(revealPanel);
  batchFadeUp(of('fade-up'));
  batchFade(of('fade'));
  batchScale(of('scale'));

  // Só agora o CSS deixa de esconder: os estados iniciais já estão aplicados pelo GSAP.
  els.forEach((el) => (el.dataset.revealed = '1'));

  return () => els.forEach((el) => el.removeAttribute('data-revealed'));
});
```

- [ ] **Step 2: Importar em `main.ts`**

Em `src/scripts/main.ts`, depois de `import './smooth-scroll';`:
```ts
import './reveal';
```

- [ ] **Step 3: Verificar**

Run: `npm test && npm run test:build`
Expected: PASS.

Run: `npm run dev`; abra `/pt/` e role. Confira: palavras do hero sobem uma a uma com máscara; subtítulo igual; habilidades "crescem" em lote; legendas e cartões sobem com fade; o painel de destaque entra por `clip-path`. Recarregue no meio da página: o que já está na tela anima uma vez e o que está acima não fica escondido. Com `prefers-reduced-motion` emulado, tudo aparece sem animar. Pare o servidor.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add scroll reveal animations (words, fade, scale, panel)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Navbar (some/volta, intro, menu mobile), paralaxe e modal do destaque

**Files:**
- Create: `src/lib/nav-state.ts`, `src/scripts/navbar.ts`, `src/scripts/preview.ts`
- Modify: `src/scripts/main.ts`
- Test: `tests/unit/nav-state.test.ts`

**Interfaces:**
- Consumes: `register`, `gsap`, `ScrollTrigger`, `MOTION` (Task 8); classes `.Navbar`, `.logo__ch`, `.nav`, `.action`, `.toggle` (Task 5); `.Preview .main`, `.media`, `#showreel-modal` (Task 5).
- Produces: `interface NavState { fixed: boolean; visible: boolean }` e `nextNavState(y: number, lastY: number, prev: NavState): NavState`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/unit/nav-state.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { nextNavState } from '../../src/lib/nav-state';

const idle = { fixed: false, visible: false };

describe('nextNavState', () => {
  it('no topo não é fixa nem visível por rolagem', () => {
    expect(nextNavState(0, 0, idle)).toEqual({ fixed: false, visible: false });
  });
  it('descendo fica fixa e escondida', () => {
    expect(nextNavState(100, 50, idle)).toEqual({ fixed: true, visible: false });
  });
  it('subindo fica fixa e visível', () => {
    expect(nextNavState(80, 100, { fixed: true, visible: false })).toEqual({ fixed: true, visible: true });
  });
  it('sem movimento mantém o estado anterior (eventos repetidos do Lenis)', () => {
    const shown = { fixed: true, visible: true };
    expect(nextNavState(80, 80, shown)).toEqual(shown);
    const hidden = { fixed: true, visible: false };
    expect(nextNavState(80, 80, hidden)).toEqual(hidden);
  });
  it('voltar ao topo solta a barra e a deixa invisível', () => {
    expect(nextNavState(0, 40, { fixed: true, visible: true })).toEqual({ fixed: false, visible: false });
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- nav-state`
Expected: FAIL.

- [ ] **Step 3: `nav-state.ts`**

```ts
export interface NavState {
  fixed: boolean;
  visible: boolean;
}

export function nextNavState(y: number, lastY: number, prev: NavState): NavState {
  if (y <= 0) return { fixed: false, visible: false };
  if (y === lastY) return prev;
  return { fixed: true, visible: lastY > y };
}
```

- [ ] **Step 4: `navbar.ts`**

```ts
import { nextNavState, type NavState } from '../lib/nav-state';
import { MOTION } from './motion-config';
import { gsap } from './gsap';
import { register } from './registry';

register((root, flags) => {
  const header = root.querySelector<HTMLElement>('.Navbar');
  if (!header) return;

  // Estado fixo (some ao descer, volta ao subir)
  let state: NavState = { fixed: false, visible: false };
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    state = nextNavState(y, lastY, state);
    lastY = y;
    header.classList.toggle('-fixed', state.fixed);
    header.classList.toggle('-visible', state.visible);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu do mobile
  const toggle = header.querySelector<HTMLButtonElement>('.toggle');
  const setOpen = (open: boolean) => {
    header.classList.toggle('-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
  };
  const onToggle = () => setOpen(!header.classList.contains('-open'));
  const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
  const onLink = (event: Event) => {
    if ((event.target as Element).closest('a')) setOpen(false);
  };
  toggle?.addEventListener('click', onToggle);
  header.addEventListener('click', onLink);
  document.addEventListener('keydown', onKey);

  // Entrada: letras do logo e itens da barra
  if (flags.animations) {
    const n = MOTION.navbar;
    const tl = gsap.timeline();
    tl.fromTo(
      header.querySelectorAll('.logo__ch'),
      { scale: 0, transformOrigin: 'center center' },
      { scale: 1, duration: n.logoDuration, stagger: n.logoStagger },
      0,
    );
    if (window.innerWidth >= 768) {
      tl.fromTo(
        header.querySelectorAll('.nav, .action'),
        { y: n.itemY, opacity: 0 },
        { y: 0, opacity: 1, duration: n.itemDuration, stagger: n.itemStagger, clearProps: 'all' },
        0,
      );
    }
  }

  return () => {
    window.removeEventListener('scroll', onScroll);
    toggle?.removeEventListener('click', onToggle);
    header.removeEventListener('click', onLink);
    document.removeEventListener('keydown', onKey);
    header.classList.remove('-fixed', '-visible', '-open');
    document.documentElement.classList.remove('menu-open');
  };
});
```

- [ ] **Step 5: `preview.ts` (paralaxe + modal)**

```ts
import { MOTION } from './motion-config';
import { getLenis } from './smooth-scroll';
import { gsap } from './gsap';
import { register } from './registry';

register((root, flags) => {
  // Paralaxe da mídia dentro de cada painel
  if (flags.animations) {
    const p = MOTION.parallax;
    root.querySelectorAll<HTMLElement>('.Preview .main').forEach((main) => {
      const media = main.querySelector<HTMLElement>('.media');
      if (!media) return;
      gsap.fromTo(
        media,
        { y: p.from, scale: p.scale },
        { y: p.to, ease: 'none', scrollTrigger: { trigger: main, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
  }

  // Modal do vídeo de destaque (só existe quando site.highlightVideo está definido)
  const dialog = root.querySelector<HTMLDialogElement>('#showreel-modal');
  const opener = root.querySelector<HTMLElement>('#destaque .main[data-cursor-icon="play"]');
  if (!dialog || !opener) return;
  const video = dialog.querySelector('video');
  const open = () => {
    dialog.showModal();
    getLenis()?.stop();
    void video?.play();
  };
  const close = () => dialog.close();
  const onClosed = () => {
    video?.pause();
    getLenis()?.start();
  };
  opener.addEventListener('click', open);
  dialog.addEventListener('click', close);
  dialog.addEventListener('close', onClosed);
  return () => {
    opener.removeEventListener('click', open);
    dialog.removeEventListener('click', close);
    dialog.removeEventListener('close', onClosed);
    if (dialog.open) dialog.close();
  };
});
```

- [ ] **Step 6: Importar em `main.ts`**

Depois de `import './reveal';`:
```ts
import './navbar';
import './preview';
```

- [ ] **Step 7: Verificar**

Run: `npm test && npm run test:build`
Expected: PASS.

Run: `npm run dev`. Confira em `/pt/`: o logo e os itens da barra entram na carga; ao descer a barra some, ao subir volta fixa e translúcida; no mobile (390px) o botão abre o menu em tela cheia, `Esc` e clique em link fecham. A mídia do painel se move levemente ao rolar. Para testar o modal: troque temporariamente `highlightVideo` em `src/content/site.ts` por um `.mp4` curto colocado em `public/`, confira que o clique no painel abre o `<dialog>`, toca o vídeo, e que clicar fecha e pausa. **Volte `highlightVideo` para `null` antes do commit.** Pare o servidor.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add navbar behavior, parallax and highlight modal" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Rolagem guiada dos serviços (scrub no desktop, clique no mobile)

**Files:**
- Create: `src/scripts/services.ts`
- Modify: `src/scripts/main.ts`

**Interfaces:**
- Consumes: `register`, `gsap`, `ScrollTrigger`, `MOTION` (Task 8); marcação e CSS de `Services.astro` (Task 6: `.Services`, `.items`, `.item`, `.item__fill`, `.item__bg`, `.item__content`, `.item__accordion`, `.item__num`, estados `.is-scrub` e `.is-accordion`).
- Produces: comportamento; adiciona `.is-scrub` (desktop) ou `.is-accordion` (mobile) à seção.

- [ ] **Step 1: Implementar `services.ts`**

```ts
import { MOTION } from './motion-config';
import { gsap, ScrollTrigger } from './gsap';
import { register } from './registry';

register((root, flags) => {
  const section = root.querySelector<HTMLElement>('.Services');
  const wrapper = section?.querySelector<HTMLElement>('.items');
  if (!section || !wrapper || !flags.animations) return;

  const items = [...wrapper.querySelectorAll<HTMLElement>('.item')];
  const mm = gsap.matchMedia();

  // Desktop: cartões abrem e escurecem conforme a rolagem (scrub).
  mm.add('(min-width: 768px)', () => {
    section.classList.add('is-scrub');

    let tops: number[] = [];
    let bottoms: number[] = [];

    const timelines = items.slice(1).map((item, k) => {
      const q = (selector: string) => item.querySelector(selector);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          scrub: MOTION.services.scrub,
          invalidateOnRefresh: true,
          start: () => `top+=${tops[k + 1] ?? 0} center+=${MOTION.services.startOffset}`,
          end: () => `top+=${bottoms[k + 1] ?? 0} center+=${MOTION.services.endOffset}`,
        },
      });
      tl.to(item, { color: '#fff', duration: 1 }, 0);
      tl.to(q('.item__fill'), { backgroundColor: '#000', duration: 1 }, 0);
      tl.to(q('.item__bg'), { opacity: 1, duration: 1, ease: 'none' }, 0);
      tl.fromTo(q('.item__accordion'), { gridTemplateRows: '0fr' }, { gridTemplateRows: '1fr', duration: 1, ease: 'none' }, 0);
      tl.to(q('.item__content'), { opacity: 1, duration: 0.6 }, 0.4);
      tl.to(q('.item__num'), { opacity: 0.5, duration: 1 }, 0);
      return tl;
    });

    // Mede a geometria com tudo fechado (estado inicial) e reserva a altura final,
    // para a página não "pular" enquanto os cartões abrem.
    const measure = () => {
      const progress = timelines.map((tl) => tl.progress());
      timelines.forEach((tl) => tl.progress(0));
      const box = wrapper.getBoundingClientRect();
      tops = items.map((item) => item.getBoundingClientRect().top - box.top);
      bottoms = items.map((item) => item.getBoundingClientRect().bottom - box.top);
      wrapper.style.minHeight = '';
      timelines.forEach((tl) => tl.progress(1));
      wrapper.style.minHeight = `${wrapper.scrollHeight}px`;
      timelines.forEach((tl, k) => tl.progress(progress[k]));
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      wrapper.style.minHeight = '';
      section.classList.remove('is-scrub');
    };
  });

  // Mobile: acordeão por clique ou teclado; o primeiro cartão começa aberto.
  mm.add('(max-width: 767px)', () => {
    section.classList.add('is-accordion');
    items[0]?.classList.add('-active');
    const cleanups = items.map((item) => {
      const head = item.querySelector<HTMLElement>('.item__head')!;
      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', String(item.classList.contains('-active')));
      const toggle = () => {
        const active = item.classList.toggle('-active');
        head.setAttribute('aria-expanded', String(active));
        window.setTimeout(() => ScrollTrigger.refresh(), 1300);
      };
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      };
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', onKey);
      return () => {
        head.removeEventListener('click', toggle);
        head.removeEventListener('keydown', onKey);
        ['role', 'tabindex', 'aria-expanded'].forEach((a) => head.removeAttribute(a));
        item.classList.remove('-active');
      };
    });
    return () => {
      cleanups.forEach((c) => c());
      section.classList.remove('is-accordion');
    };
  });

  return () => mm.revert();
});
```

- [ ] **Step 2: Importar em `main.ts`**

Depois de `import './preview';`:
```ts
import './services';
```

- [ ] **Step 3: Verificar**

Run: `npm test && npm run test:build`
Expected: PASS.

Run: `npm run dev`. No desktop, role pela seção Serviços: o primeiro cartão já está preto e aberto; os seguintes, claros e fechados, escurecem e abrem conforme passam perto do centro, sem a página "pular". Redimensione a janela para menos de 768px: vira acordeão (clique e Enter/Espaço abrem). Volte ao desktop: volta ao scrub. Com `prefers-reduced-motion` emulado: todos os cartões ficam pretos e abertos. Pare o servidor.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add scroll-scrubbed services cards with mobile accordion" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Cursor customizado e vídeo no hover dos cartões

**Files:**
- Create: `src/lib/cursor-state.ts`, `src/scripts/cursor.ts`, `src/scripts/card-video.ts`
- Modify: `src/layouts/Base.astro`, `src/styles/global.css`, `src/scripts/main.ts`
- Test: `tests/unit/cursor-state.test.ts`

**Interfaces:**
- Consumes: `register`, `gsap`, `MOTION` (Task 8); atributos `data-cursor-icon` (Tasks 5–7).
- Produces: `type CursorIcon = 'play' | 'arrow-up-right' | 'times'`; `interface CursorState { icon: CursorIcon | null }`; `resolveCursorState(el: { closest(selector: string): { dataset: Record<string, string | undefined> } | null } | null): CursorState`; `ICONS: Record<CursorIcon, string>` (SVG como string).

- [ ] **Step 1: Escrever o teste que falha**

`tests/unit/cursor-state.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { ICONS, resolveCursorState } from '../../src/lib/cursor-state';

const el = (dataset: Record<string, string | undefined> | null) => ({
  closest: () => (dataset ? { dataset } : null),
});

describe('resolveCursorState', () => {
  it('lê o ícone do elemento mais próximo', () => {
    expect(resolveCursorState(el({ cursorIcon: 'play' }))).toEqual({ icon: 'play' });
    expect(resolveCursorState(el({ cursorIcon: 'arrow-up-right' }))).toEqual({ icon: 'arrow-up-right' });
    expect(resolveCursorState(el({ cursorIcon: 'times' }))).toEqual({ icon: 'times' });
  });
  it('sem elemento ou sem atributo, não há ícone', () => {
    expect(resolveCursorState(null)).toEqual({ icon: null });
    expect(resolveCursorState(el(null))).toEqual({ icon: null });
    expect(resolveCursorState(el({}))).toEqual({ icon: null });
  });
  it('ignora ícones desconhecidos', () => {
    expect(resolveCursorState(el({ cursorIcon: 'explode' }))).toEqual({ icon: null });
  });
  it('todo ícone tem um SVG', () => {
    for (const key of ['play', 'arrow-up-right', 'times'] as const) expect(ICONS[key]).toContain('<svg');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- cursor-state`
Expected: FAIL.

- [ ] **Step 3: `cursor-state.ts`**

```ts
export type CursorIcon = 'play' | 'arrow-up-right' | 'times';

export interface CursorState {
  icon: CursorIcon | null;
}

const KNOWN: readonly string[] = ['play', 'arrow-up-right', 'times'];

type Closest = { closest(selector: string): { dataset: Record<string, string | undefined> } | null };

export function resolveCursorState(el: Closest | null): CursorState {
  const icon = el?.closest('[data-cursor-icon]')?.dataset.cursorIcon;
  return { icon: icon && KNOWN.includes(icon) ? (icon as CursorIcon) : null };
}

const svg = (path: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

export const ICONS: Record<CursorIcon, string> = {
  play: svg('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>'),
  'arrow-up-right': svg('<path d="M7 17 17 7M8.5 7H17v8.5"/>'),
  times: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
};
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- cursor-state`
Expected: PASS.

- [ ] **Step 5: Elemento do cursor, estilos e script**

Em `src/layouts/Base.astro`, logo depois de `<body>`, antes de `<slot />`:
```astro
    <div class="Cursor" transition:persist aria-hidden="true">
      <div class="Cursor__inner"><span class="Cursor__icon"></span></div>
    </div>
```

Acrescente a `src/styles/global.css`:
```css
.Cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
  mix-blend-mode: exclusion;
  opacity: 0;
  transition: opacity 0.3s;
}
.Cursor.-visible {
  opacity: 1;
}
.Cursor__inner {
  display: grid;
  place-items: center;
  width: 1.4rem;
  height: 1.4rem;
  margin: -0.7rem 0 0 -0.7rem;
  border-radius: 50%;
  background: #fff;
  color: #000;
  transition:
    width 0.6s var(--ease-out),
    height 0.6s var(--ease-out),
    margin 0.6s var(--ease-out);
}
.Cursor.-icon .Cursor__inner {
  width: 8rem;
  height: 8rem;
  margin: -4rem 0 0 -4rem;
}
.Cursor__icon {
  width: 3.2rem;
  opacity: 0;
  transition: opacity 0.3s;
}
.Cursor.-icon .Cursor__icon {
  opacity: 1;
  transition-delay: 0.15s;
}
```

`src/scripts/cursor.ts`:
```ts
import { ICONS, resolveCursorState, type CursorIcon } from '../lib/cursor-state';
import { MOTION } from './motion-config';
import { gsap } from './gsap';
import { register } from './registry';

register((_root, flags) => {
  if (!flags.cursor) return;
  const el = document.querySelector<HTMLElement>('.Cursor');
  const iconBox = el?.querySelector<HTMLElement>('.Cursor__icon');
  if (!el || !iconBox) return;

  const { speed, skewing } = MOTION.cursor;
  const setX = gsap.quickTo(el, 'x', { duration: speed, ease: 'power3.out' });
  const setY = gsap.quickTo(el, 'y', { duration: speed, ease: 'power3.out' });
  let last = { x: 0, y: 0, t: 0 };
  let shown: CursorIcon | null = null;

  const setIcon = (icon: CursorIcon | null) => {
    if (icon === shown) return;
    shown = icon;
    el.classList.toggle('-icon', icon !== null);
    if (icon) iconBox.innerHTML = ICONS[icon];
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    el.classList.add('-visible');
    setX(event.clientX);
    setY(event.clientY);

    const now = performance.now();
    const dt = Math.max(now - last.t, 1);
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    const velocity = Math.hypot(dx, dy) / dt;
    last = { x: event.clientX, y: event.clientY, t: now };
    if (velocity > 0.05) {
      const stretch = Math.min(velocity * 0.12 * skewing, 0.6);
      gsap.to(el, {
        rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
        scaleX: 1 + stretch,
        scaleY: 1 - stretch * 0.4,
        duration: 0.15,
        overwrite: 'auto',
      });
      gsap.to(el, { scaleX: 1, scaleY: 1, duration: 0.5, delay: 0.1, overwrite: 'auto' });
    }
    setIcon(resolveCursorState(event.target as Element | null).icon);
  };
  const onLeave = () => el.classList.remove('-visible');

  document.addEventListener('pointermove', onMove);
  document.documentElement.addEventListener('mouseleave', onLeave);

  return () => {
    document.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    setIcon(null);
    el.classList.remove('-visible');
  };
});
```

`src/scripts/card-video.ts`:
```ts
import { register } from './registry';

register((root, flags) => {
  if (!flags.cursor) return;
  const cleanups: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('.Card').forEach((card) => {
    const video = card.querySelector('video');
    if (!video) return;
    const play = () => {
      video.currentTime = 0;
      void video.play();
    };
    const pause = () => video.pause();
    card.addEventListener('mouseenter', play);
    card.addEventListener('mouseleave', pause);
    cleanups.push(() => {
      card.removeEventListener('mouseenter', play);
      card.removeEventListener('mouseleave', pause);
      video.pause();
    });
  });
  return () => cleanups.forEach((c) => c());
});
```

Depois de `import './services';` em `main.ts`:
```ts
import './cursor';
import './card-video';
```

- [ ] **Step 6: Verificar**

Run: `npm test && npm run test:build`
Expected: PASS.

Run: `npm run dev`. No desktop com mouse: um ponto branco com blend `exclusion` segue o mouse com atraso e se estica na direção do movimento; sobre cartões de projeto, logos e links sociais vira um círculo grande com seta; sobre o painel de destaque com vídeo (se ligado) mostra o play. No emulador de toque e com `prefers-reduced-motion`, o cursor não aparece. Pare o servidor.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add custom cursor and card video hover" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Transição de página, troca de idioma com hash e botão de copiar e-mail

**Files:**
- Create: `src/lib/clipboard.ts`, `src/scripts/loader.ts`, `src/scripts/lang-switch.ts`, `src/scripts/clipboard-button.ts`
- Modify: `src/layouts/Base.astro`, `src/styles/global.css`, `src/scripts/main.ts`
- Test: `tests/unit/clipboard.test.ts`

**Interfaces:**
- Consumes: `register`, `gsap`, `MOTION` (Task 8); `withHash` (Task 2); `[data-lang-switch][data-base]` (Tasks 5, 6); `[data-clipboard-copy][data-copied][data-failed]` (Task 6).
- Produces: `interface ClipboardDeps { writeText?: (text: string) => Promise<void>; legacyCopy?: (text: string) => boolean }`, `copyText(text: string, deps: ClipboardDeps): Promise<boolean>`, `browserDeps(): ClipboardDeps`.

- [ ] **Step 1: Escrever o teste que falha**

`tests/unit/clipboard.test.ts`:
```ts
import { describe, expect, it, vi } from 'vitest';
import { copyText } from '../../src/lib/clipboard';

describe('copyText', () => {
  it('usa a API moderna quando funciona', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await copyText('a@b.c', { writeText })).toBe(true);
    expect(writeText).toHaveBeenCalledWith('a@b.c');
  });

  it('cai para a cópia antiga quando a API moderna rejeita (permissão negada)', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const legacyCopy = vi.fn().mockReturnValue(true);
    expect(await copyText('a@b.c', { writeText, legacyCopy })).toBe(true);
    expect(legacyCopy).toHaveBeenCalledWith('a@b.c');
  });

  it('cai para a cópia antiga quando não há API moderna (http, navegador antigo)', async () => {
    const legacyCopy = vi.fn().mockReturnValue(true);
    expect(await copyText('a@b.c', { legacyCopy })).toBe(true);
  });

  it('devolve false, sem lançar, quando nada funciona', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const legacyCopy = vi.fn(() => {
      throw new Error('no execCommand');
    });
    await expect(copyText('a@b.c', { writeText, legacyCopy })).resolves.toBe(false);
    await expect(copyText('a@b.c', {})).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npm test -- clipboard`
Expected: FAIL.

- [ ] **Step 3: `clipboard.ts`**

```ts
export interface ClipboardDeps {
  writeText?: (text: string) => Promise<void>;
  legacyCopy?: (text: string) => boolean;
}

export async function copyText(text: string, deps: ClipboardDeps): Promise<boolean> {
  if (deps.writeText) {
    try {
      await deps.writeText(text);
      return true;
    } catch {
      // segue para a cópia antiga
    }
  }
  if (deps.legacyCopy) {
    try {
      return deps.legacyCopy(text);
    } catch {
      return false;
    }
  }
  return false;
}

export function browserDeps(): ClipboardDeps {
  const clipboard = navigator.clipboard;
  return {
    writeText: clipboard?.writeText ? (text) => clipboard.writeText(text) : undefined,
    legacyCopy: (text) => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    },
  };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test -- clipboard`
Expected: PASS.

- [ ] **Step 5: Botão de copiar e troca de idioma**

`src/scripts/clipboard-button.ts`:
```ts
import { browserDeps, copyText } from '../lib/clipboard';
import { register } from './registry';

register((root) => {
  const cleanups: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('[data-clipboard-copy]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('.Pill__label') ?? button;
    const original = label.textContent ?? '';
    let timer = 0;
    const onClick = async (event: Event) => {
      event.preventDefault();
      const text = button.dataset.clipboardCopy ?? '';
      const ok = await copyText(text, browserDeps());
      window.clearTimeout(timer);
      if (ok) {
        button.classList.add('-alt');
        label.textContent = button.dataset.copied ?? original;
      } else {
        button.classList.add('-failed');
        label.textContent = `${button.dataset.failed ?? ''} ${text}`.trim();
      }
      timer = window.setTimeout(() => {
        button.classList.remove('-alt', '-failed');
        label.textContent = original;
      }, ok ? 1000 : 4000);
    };
    button.addEventListener('click', onClick);
    cleanups.push(() => {
      window.clearTimeout(timer);
      button.removeEventListener('click', onClick);
      label.textContent = original;
    });
  });
  return () => cleanups.forEach((c) => c());
});
```

`src/scripts/lang-switch.ts`:
```ts
import { withHash } from '../lib/i18n';
import { register } from './registry';

// Mantém a âncora atual (#projetos etc.) ao trocar de idioma: os ids das seções são iguais nos dois.
register(() => {
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('[data-lang-switch]');
    if (!link?.dataset.base) return;
    link.href = withHash(link.dataset.base, location.hash);
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
});
```

- [ ] **Step 6: Transição de página**

Em `src/layouts/Base.astro`, logo depois do bloco do cursor:
```astro
    <div class="Loader" transition:persist aria-hidden="true">
      <div class="backdrop"></div>
      <div class="fill"></div>
    </div>
```

Acrescente a `src/styles/global.css`:
```css
.Loader {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: none;
  pointer-events: none;
}
.Loader .backdrop,
.Loader .fill {
  position: absolute;
  inset: 0;
}
.Loader .backdrop {
  background: rgb(0 0 0 / 0.2);
  opacity: 0;
}
.Loader .fill {
  background: #000;
  transform: scaleY(0);
  transform-origin: bottom;
}
```

`src/scripts/loader.ts`:
```ts
import { motionFlags, readEnv } from '../lib/capabilities';
import { MOTION } from './motion-config';
import { gsap } from './gsap';

interface PreparationEvent extends Event {
  loader: () => Promise<void>;
}

const enabled = () => motionFlags(readEnv(window)).animations;
const parts = () => {
  const el = document.querySelector<HTMLElement>('.Loader');
  return el
    ? { el, backdrop: el.querySelector<HTMLElement>('.backdrop')!, fill: el.querySelector<HTMLElement>('.fill')! }
    : null;
};

async function show() {
  const p = parts();
  if (!p) return;
  const { duration, ease } = MOTION.loader;
  gsap.set(p.el, { display: 'block', pointerEvents: 'auto' });
  gsap.set(p.fill, { opacity: 1, scaleY: 0, transformOrigin: 'bottom' });
  await gsap
    .timeline()
    .to(p.backdrop, { opacity: 1, duration }, 0)
    .to(p.fill, { scaleY: 1, duration, ease }, 0);
}

async function hide() {
  const p = parts();
  if (!p || getComputedStyle(p.el).display === 'none') return;
  await gsap.to(p.fill, { opacity: 0, duration: MOTION.loader.hideDuration });
  gsap.set(p.el, { display: 'none', pointerEvents: 'none' });
  gsap.set(p.backdrop, { opacity: 0 });
}

// Registrado uma vez; o ClientRouter chama estes eventos a cada navegação.
document.addEventListener('astro:before-preparation', (event) => {
  if (!enabled()) return;
  const e = event as PreparationEvent;
  const original = e.loader;
  e.loader = async () => {
    await show();
    await original();
  };
});
document.addEventListener('astro:page-load', () => void hide());
```

Em `src/scripts/main.ts`, depois dos imports anteriores:
```ts
import './clipboard-button';
import './lang-switch';
import './loader';
```

Em `src/components/Home.astro` e `src/components/ProjectPage.astro`, adicione `transition:animate="none"` ao `<main id="main">` para a transição padrão do Astro não competir com o painel:
```astro
<main id="main" transition:animate="none">
```

- [ ] **Step 7: Verificar**

Run: `npm test && npm run test:build`
Expected: PASS.

Run: `npm run dev`. Confira: (a) clicar em um projeto sobe o painel preto de baixo para cima e a página nova aparece, sem recarregar; voltar faz o mesmo; (b) após ir casa → projeto → casa → projeto, no console de DevTools rode `document.querySelectorAll('.Cursor').length` (deve ser `1`) e role a página (rolagem suave única, sem velocidade dobrada); (c) o botão "Copiar e-mail" troca o texto para "Copiado!" por 1s; para simular falha, em DevTools rode `Object.defineProperty(navigator,'clipboard',{value:undefined})` e `document.execCommand=()=>false` e clique: aparece "Não consegui copiar. O e-mail é: …"; (d) em `/pt/#projetos`, o link "EN" leva a `/en/#projetos`; (e) com `prefers-reduced-motion` emulado, a navegação troca de página sem o painel preto. Pare o servidor.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add page transition, language switch with hash and copy-email button" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Verificação final, Lighthouse e documentação de deploy

**Files:**
- Create: `README.md`, `.env.example`
- Modify: o que o Lighthouse e a revisão apontarem (somente para atingir as metas)

**Interfaces:**
- Consumes: tudo.
- Produces: README com instruções de uso, troca de conteúdo e deploy; relatório de verificação.

- [ ] **Step 1: Suíte completa e checagem de tipos**

Run: `npm test && npm run test:build && npm run check`
Expected: testes PASS; `astro check` sem erros. Corrija qualquer erro de tipo antes de seguir.

- [ ] **Step 2: Lighthouse (desempenho e acessibilidade acima de 90)**

Run (build já feito pelo passo anterior):
```bash
npm run preview -- --port 4322 &
sleep 3
npx -y lighthouse http://localhost:4322/pt/ --only-categories=performance,accessibility --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-pt.json --quiet
npx -y lighthouse http://localhost:4322/pt/projetos/aurora/ --only-categories=performance,accessibility --chrome-flags="--headless=new" --output=json --output-path=/tmp/lh-project.json --quiet
node -e "for (const f of ['/tmp/lh-pt.json','/tmp/lh-project.json']) { const r=require(f).categories; console.log(f, 'perf', r.performance.score*100, 'a11y', r.accessibility.score*100) }"
kill %1
```
Expected: `perf` e `a11y` ≥ 90 nas duas páginas. Se algum ficar abaixo, abra o relatório (`jq '.audits | to_entries[] | select(.value.score != null and .value.score < 0.9) | .key' /tmp/lh-pt.json`), corrija a causa (contraste, `alt`, nomes acessíveis, tamanho de imagem, JS bloqueante) e repita. Não afrouxe a meta.

- [ ] **Step 3: Verificação manual no navegador (checklist do spec)**

Rode `npm run dev` e confira cada item, anotando o resultado:
1. Desktop 1440px e mobile 390px: as 6 seções na ordem Hero, Destaque, Sobre (com habilidades), Serviços, Projetos, Vamos conversar + footer.
2. Rolagem suave (Lenis) no desktop; nativa no emulador de toque.
3. Cursor customizado no desktop; ausente no toque e com movimento reduzido.
4. Revelações de texto, scrub dos serviços, entrada do painel e paralaxe.
5. Transição de página nos dois sentidos; classes `js` e `motion` continuam no `<html>` após navegar (`document.documentElement.className`).
6. Modal do destaque (com um vídeo temporário; remova depois).
7. `prefers-reduced-motion`: tudo visível, sem animação, sem Lenis, sem cursor, sem painel de transição.
8. Sem JavaScript (DevTools → desativar JS): todo o conteúdo visível; a raiz `/` mostra os links de idioma.
9. Troca PT/EN em home e em página de projeto.
10. Comparação lado a lado com cuberto.com, só para conferir ritmo e proporções.
Se algo falhar, corrija na origem (não no teste) e reexecute a suíte.

- [ ] **Step 4: README e `.env.example`**

`.env.example`:
```
# Endereço público do site (usado em canonical, hreflang, og:url e sitemap)
SITE_URL=https://seu-dominio.com
```

`README.md` (preencha as versões com as de `npm ls astro gsap lenis`):
```markdown
# Portfólio Ivy Gabriel

Site estático bilíngue (PT/EN) feito com Astro, GSAP e Lenis. Design e spec em `docs/superpowers/`.

## Rodar

    npm install
    npm run dev        # http://localhost:4321
    npm test           # testes unitários
    npm run test:build # build + testes sobre dist/
    npm run check      # tipos

## Trocar o conteúdo de exemplo

1. `src/content/site.ts`: nome, e-mail, redes, vídeo do destaque; ponha `example: false`.
2. `src/content/pt.json` e `src/content/en.json`: textos (as chaves precisam ser iguais; `npm test` confere).
3. `src/content/projects/*.json`: um arquivo por projeto (3 a 4). Troque `example` por `false`, aponte `cover` e `shots` para suas imagens em `public/media/projects/<slug>/` e ajuste `palette`.
4. Quando não houver mais conteúdo de exemplo, o `noindex` das páginas some sozinho.
5. Troque `public/og-cover.png` (rode `node scripts/gen-og.mjs` ou ponha sua imagem 1200×630).

## Publicar (Vercel ou Netlify)

1. Suba o repositório no GitHub.
2. Importe o repositório na Vercel (ou Netlify): framework Astro, comando `npm run build`, pasta `dist`.
3. Defina a variável `SITE_URL` com o endereço final do site.
4. A cada push na branch principal o site é publicado.
```

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "docs: add README and finalize verification" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

## Self-Review (feita contra o spec)

**Cobertura do spec:**
- Objetivo, critérios e fora de escopo → Global Constraints e Task 14.
- Stack (Astro, ClientRouter, GSAP ScrollTrigger+SplitText, Lenis, Instrument Sans) → Tasks 1, 4, 8, 9.
- Escala fluida (0,625vw / 2,667vw / 768px / limites) → Task 1 (com teste).
- Home com 6 seções na ordem; Sobre com habilidades; Serviços antes de Projetos; opcionais fora → Tasks 5, 6 (teste de ordem em `home-bottom`).
- Painel de destaque em código + modal opcional com vídeo → Tasks 5, 10.
- Página de projeto (Tophead, Preview, Visão geral, Splitshow, Próximo) → Task 7.
- Rotas `/pt/`, `/en/`, `/pt/projetos/[slug]`, `/en/projects/[slug]`, redirecionamento por idioma → Tasks 2, 4, 7.
- Conteúdo separado em JSON; paridade PT/EN; projetos com os dois idiomas → Task 3.
- Mídia de exemplo gerada; marcação de exemplo + `noindex` → Tasks 3, 4.
- SEO (`og:*`, `twitter:card`, hreflang, sitemap) → Task 4.
- Animações: revelação de palavras, fade-up, escala, fade, painel (clip-path + paralaxe), scrub dos serviços, navbar, cursor, vídeo no hover, transição de página, modal, botão de copiar → Tasks 8–13; valores fixados em `MOTION` com teste.
- `prefers-reduced-motion` desliga GSAP, Lenis, cursor e loader; cursor e Lenis só com ponteiro fino e sem toque → Tasks 8, 12, 13 (flags testadas).
- `will-change` só durante a execução → `reveal.ts` (set antes e depois de cada timeline).
- Testes (build, conteúdo, manual, Lighthouse) → Tasks 3, 4, 6, 7, 8, 14.
- Deploy → Task 14 (README).

**Placeholders:** nenhum "TBD/TODO"; os textos de exemplo são conteúdo real e marcado como exemplo.

**Consistência de tipos:** `Locale`, `Project`, `MotionFlags`, `NavState`, `CursorIcon` e as assinaturas de `register/mount/unmount`, `copyText`, `resolveCursorState`, `nextNavState`, `pickLocale`, `projectPath/homePath` são usadas com os mesmos nomes em todos os tasks. Atributos e classes compartilhados (`data-reveal`, `data-revealed`, `data-cursor-icon`, `data-lang-switch`/`data-base`, `data-clipboard-copy`/`data-copied`/`data-failed`, `.Preview .main`, `.item__*`) batem entre a marcação (Tasks 5–7) e os scripts (Tasks 9–13).

**Decisões minhas que o spec deixava em aberto (revise):**
1. A pílula "Contato" fica na barra de navegação (como no Cuberto), não duplicada no hero.
2. `pickLocale`: qualquer idioma que não seja português vira `en`; lista vazia vira `pt`.
3. Estado inicial claro dos cartões de serviços (lavanda `#f1f3fa`) e do acordeão mobile são escolhas minhas; o Cuberto não mostrou esse estado.
4. Redes no footer usam siglas em círculos (GH, IN, IG) como marcador; troque por ícones quando quiser.
5. Imagem Open Graph única para todas as páginas (SVGs não servem para compartilhamento).
