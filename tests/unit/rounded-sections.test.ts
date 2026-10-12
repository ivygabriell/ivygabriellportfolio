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

  it('só o Selected work (entrando do claro) usa a entrada arredondada; nada sobrepõe nada', () => {
    for (const file of ['components/Outro.astro', 'components/Footer.astro', 'components/ProjectPage.astro'])
      expect(src(file), file).not.toMatch(/margin-top:\s*calc\(-1/);
    expect(src('components/Work.astro')).not.toContain('var(--r-top)');
  });

  it('o footer é reto', () => {
    expect(src('components/Footer.astro')).toMatch(/\.Footer\s*\{[^}]*border-radius:\s*0/);
  });

  it('o footer não desenha mais a linha de topo (ela seguiria a curva)', () => {
    expect(src('components/Footer.astro')).not.toContain('border-top');
  });
});
