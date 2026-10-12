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

  it('o texto do © no footer cobalto (branco a 90%) passa de 4,5:1', () => {
    const accent = rgb(hex('--c-accent'));
    const text = blend([255, 255, 255], 0.9, accent);
    expect(ratio(text, accent)).toBeGreaterThanOrEqual(4.5);
    expect(readFileSync('src/components/Footer.astro', 'utf8')).toContain('rgb(255 255 255 / 0.9)');
  });

  it('branco puro sobre o footer cobalto e o --c-ink sobre a pílula clara hover passam de 4,5:1', () => {
    expect(ratio([255, 255, 255], rgb(hex('--c-accent')))).toBeGreaterThanOrEqual(4.5);
    expect(ratio([255, 255, 255], rgb(hex('--c-ink')))).toBeGreaterThanOrEqual(4.5);
  });
});
