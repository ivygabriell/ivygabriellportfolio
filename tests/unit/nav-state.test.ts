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
