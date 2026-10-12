import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (path: string) => readFileSync(`src/${path}`, 'utf8');

describe('entrada arredondada das seções escuras', () => {
  it('toda seção -inverse tem os cantos de cima arredondados pelo token --r-top', () => {
    expect(src('styles/global.css')).toMatch(
      /\.-inverse\s*\{[^}]*border-radius:\s*var\(--r-top\)\s+var\(--r-top\)\s+0\s+0/,
    );
  });

  it('o raio diminui no mobile', () => {
    const tokens = src('styles/tokens.css');
    const desktop = tokens.match(/--r-top:\s*([\d.]+)rem/)![1];
    const mobile = tokens.match(/@media \(max-width: 767px\)[\s\S]*?--r-top:\s*([\d.]+)rem/);
    expect(mobile, 'override do --r-top no bloco mobile').not.toBeNull();
    expect(Number(mobile![1])).toBeLessThan(Number(desktop));
  });

  it('o Contato sobrepõe o Selected work pelo raio, para os cantos revelarem a cor dele', () => {
    expect(src('components/Outro.astro')).toContain('margin-top: calc(-1 * var(--r-top))');
  });

  it('o Selected work reserva o raio no fim para o Contato sobrepor sem comer o espaçamento', () => {
    expect(src('components/Work.astro')).toContain('calc(16rem + var(--r-top))');
  });

  it('o footer não é arredondado nem sobrepõe o Contato', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toMatch(/\.Footer\s*\{[^}]*border-radius:\s*0/);
    expect(footer).not.toContain('var(--r-top)');
    expect(footer).not.toMatch(/\.Footer\s*\{[^}]*position:\s*relative/);
  });

  it('o Contato e o próximo projeto não reservam mais o raio no fim (o footer não sobrepõe)', () => {
    expect(src('components/Outro.astro')).toContain('padding-block: 18rem 16rem;');
    expect(src('components/Outro.astro')).toContain('padding-block: 10rem 8rem;');
    expect(src('components/ProjectPage.astro')).not.toContain('var(--r-top)');
  });

  it('o footer não desenha mais a linha de topo (ela seguiria a curva)', () => {
    expect(src('components/Footer.astro')).not.toContain('border-top');
  });
});
