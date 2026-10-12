import { describe, expect, it } from 'vitest';
import { motionFlags, readEnv } from '../../src/lib/capabilities';

const win = (matches: Record<string, boolean>) => ({
  matchMedia: (query: string) => ({ matches: !!matches[query] }),
});

describe('readEnv', () => {
  it('lê as três media queries', () => {
    const env = readEnv(win({ '(pointer: fine)': true }));
    expect(env).toEqual({ reducedMotion: false, finePointer: true, touch: false });
  });
});

describe('motionFlags', () => {
  it('liga tudo no desktop com mouse', () => {
    expect(motionFlags({ reducedMotion: false, finePointer: true, touch: false })).toEqual({
      animations: true, smoothScroll: true, cursor: true,
    });
  });

  it('desliga tudo com prefers-reduced-motion, mesmo com mouse', () => {
    expect(motionFlags({ reducedMotion: true, finePointer: true, touch: false })).toEqual({
      animations: false, smoothScroll: false, cursor: false,
    });
  });

  it('no toque mantém animações, mas sem Lenis nem cursor', () => {
    expect(motionFlags({ reducedMotion: false, finePointer: false, touch: true })).toEqual({
      animations: true, smoothScroll: false, cursor: false,
    });
  });

  it('sem ponteiro fino nem grosso: Lenis sim, cursor não', () => {
    expect(motionFlags({ reducedMotion: false, finePointer: false, touch: false })).toEqual({
      animations: true, smoothScroll: true, cursor: false,
    });
  });
});
