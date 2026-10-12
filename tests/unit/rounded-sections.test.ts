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

  it.each(['components/Outro.astro', 'components/Footer.astro'])(
    '%s sobrepõe a seção anterior pelo raio, para os cantos revelarem a cor dela',
    (file) => {
      expect(src(file)).toContain('margin-top: calc(-1 * var(--r-top))');
    },
  );

  it('o footer fica acima da seção anterior na sobreposição (position: relative)', () => {
    expect(src('components/Footer.astro')).toMatch(/\.Footer\s*\{[^}]*position:\s*relative/);
  });

  it.each(['components/Work.astro', 'components/Outro.astro', 'components/ProjectPage.astro'])(
    '%s reserva o raio no fim para a seção seguinte sobrepor sem comer o espaçamento',
    (file) => {
      expect(src(file)).toContain('var(--r-top)');
    },
  );

  it('o footer não desenha mais a linha de topo (ela seguiria a curva)', () => {
    expect(src('components/Footer.astro')).not.toContain('border-top');
  });
});
