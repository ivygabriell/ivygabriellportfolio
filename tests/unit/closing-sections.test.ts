import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (path: string) => readFileSync(`src/${path}`, 'utf8');

describe('Contato e footer em uma cor só', () => {
  it('o Contato não importa nem desenha a arte de triângulos', () => {
    const outro = src('components/Outro.astro');
    expect(outro).not.toContain('GradientArt');
    expect(outro).not.toContain('class="art"');
  });

  it('o Contato não tem gradiente de fundo', () => {
    expect(src('components/Outro.astro').toLowerCase()).not.toContain('gradient');
  });

  it('Contato e footer usam o mesmo fundo sólido (.-inverse = --c-ink)', () => {
    expect(src('components/Outro.astro')).toMatch(/<section class="Outro -inverse"/);
    expect(src('components/Footer.astro')).toMatch(/<footer class="Footer -inverse"/);
    expect(src('styles/global.css')).toMatch(/\.-inverse\s*\{[^}]*background:\s*var\(--c-ink\)/);
    expect(src('components/Outro.astro')).not.toMatch(/\.Outro\s*\{[^}]*background/);
    expect(src('components/Footer.astro')).not.toMatch(/\.Footer\s*\{[^}]*background/);
  });

  it('o footer não tem e-mail (nem pílula, nem link): o e-mail fica no Contato', () => {
    const footer = src('components/Footer.astro');
    expect(footer).not.toContain('site.email');
    expect(footer).not.toContain('mailto:');
    expect(footer).not.toMatch(/\.pill\s*\{/);
  });
});
