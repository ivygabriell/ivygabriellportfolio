import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pill = readFileSync('src/components/Pill.astro', 'utf8');
const rule = (selector: string) => {
  const m = pill.match(new RegExp(`${selector.replace(/[.:()]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  if (!m) throw new Error(`regra não encontrada: ${selector}`);
  return m[1];
};

describe('hover dos botões (Pill)', () => {
  it('o preenchimento não usa a curva de mola: ela passava do topo e deixava o fundo do botão à mostra', () => {
    expect(pill).not.toContain('--ease-spring');
    expect(rule('.Pill::before')).toMatch(/transition:[^;]*transform\s+0\.7s\s+var\(--ease-out\)/);
  });

  it('no estado final o preenchimento é reto (border-radius 0) e cobre o botão inteiro, sem "orelhas"', () => {
    // O hover fica dentro de @media (pointer: fine) (mobile-structure.test.ts); o foco por teclado vale sempre.
    expect(rule('.Pill:hover::before')).toMatch(/border-radius:\s*0/);
    expect(rule('.Pill:focus-visible::before')).toMatch(/border-radius:\s*0/);
    expect(rule('.Pill::before')).toMatch(/transition:[^;]*border-radius\s+0\.7s\s+var\(--ease-out\)/);
  });

  it('a cor do texto acompanha o preenchimento (mesma família de curva), sem esperar mais que ele', () => {
    expect(rule('.Pill')).toMatch(/transition:\s*color\s+0\.4s\s+var\(--ease-out\)/);
  });

  it('com movimento reduzido não há transição no preenchimento', () => {
    expect(pill).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.Pill::before\s*\{\s*transition:\s*none/);
  });
});
