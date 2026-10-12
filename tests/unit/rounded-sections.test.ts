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

  it('o footer entra arredondado por cima dos Serviços: sobrepõe pelo raio e fica acima na pilha', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toMatch(/\.Footer\s*\{[^}]*border-radius:\s*var\(--r-top\)\s+var\(--r-top\)\s+0\s+0/);
    expect(footer).toMatch(/\.Footer\s*\{[^}]*margin-top:\s*calc\(-1 \* var\(--r-top\)\)/);
    expect(footer).toMatch(/\.Footer\s*\{[^}]*position:\s*relative/);
  });

  it('o fim dos Serviços e do "próximo projeto" reserva o raio, para o footer sobrepor sem comer o espaçamento', () => {
    expect(src('components/Work.astro')).toContain('calc(16rem + var(--r-top))');
    expect(src('components/ProjectPage.astro')).toContain('calc(14rem + var(--r-top))');
  });

  it('nenhuma outra seção sobrepõe a anterior', () => {
    for (const file of ['components/Outro.astro', 'components/Work.astro'])
      expect(src(file), file).not.toMatch(/margin-top:\s*calc\(-1/);
  });

  it('o footer não desenha mais a linha de topo (ela seguiria a curva)', () => {
    expect(src('components/Footer.astro')).not.toContain('border-top');
  });
});
