import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (path: string) => readFileSync(`src/${path}`, 'utf8');

const LEGACY = ['#4338ca', '#818cf8', '#312e81', '#c7d2fe', '#fde68a', '#fbcfe8', '#e3f5f3', '#f1f3fa', '#111'];
const SCANNED = [
  'components/Pill.astro',
  'components/Work.astro',
  'components/Footer.astro',
  'components/Navbar.astro',
  'components/Highlight.astro',
  'components/Outro.astro',
  'components/ProjectPage.astro',
  'components/Panel.astro',
  'styles/global.css',
  'styles/tokens.css',
  'scripts/services.ts',
];
const NO_PURE_BLACK = [
  'components/Pill.astro',
  'components/Work.astro',
  'components/Footer.astro',
  'components/Navbar.astro',
  'components/Outro.astro',
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
