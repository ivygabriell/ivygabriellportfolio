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

  it('tablet (768 a 1279px) reduz margens e coluna de rótulo para o layout não espremer', () => {
    const tablet = tokens.match(/@media \(min-width: 768px\) and \(max-width: 1279px\)\s*\{[\s\S]*?\n\}/);
    expect(tablet, 'bloco de media query do tablet').not.toBeNull();
    for (const name of ['--gutter', '--narrow', '--label-col']) expect(tablet![0]).toContain(name);
  });

  it('define a coluna de rótulo que About e a visão geral do projeto usam', () => {
    expect(tokens).toMatch(/:root\s*\{[^}]*--label-col:\s*28rem/);
  });
});
