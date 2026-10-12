import { describe, expect, it } from 'vitest';
import { ICONS, resolveCursorState } from '../../src/lib/cursor-state';

const el = (dataset: Record<string, string | undefined> | null) => ({
  closest: () => (dataset ? { dataset } : null),
});

describe('resolveCursorState', () => {
  it('lê o ícone do elemento mais próximo', () => {
    expect(resolveCursorState(el({ cursorIcon: 'play' }))).toEqual({ icon: 'play' });
    expect(resolveCursorState(el({ cursorIcon: 'arrow-up-right' }))).toEqual({ icon: 'arrow-up-right' });
    expect(resolveCursorState(el({ cursorIcon: 'times' }))).toEqual({ icon: 'times' });
  });
  it('sem elemento ou sem atributo, não há ícone', () => {
    expect(resolveCursorState(null)).toEqual({ icon: null });
    expect(resolveCursorState(el(null))).toEqual({ icon: null });
    expect(resolveCursorState(el({}))).toEqual({ icon: null });
  });
  it('ignora ícones desconhecidos', () => {
    expect(resolveCursorState(el({ cursorIcon: 'explode' }))).toEqual({ icon: null });
  });
  it('todo ícone tem um SVG', () => {
    for (const key of ['play', 'arrow-up-right', 'times'] as const) expect(ICONS[key]).toContain('<svg');
  });
});
