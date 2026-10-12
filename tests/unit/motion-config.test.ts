import { describe, expect, it } from 'vitest';
import { MOTION } from '../../src/scripts/motion-config';

describe('MOTION (valores medidos na análise do Cuberto)', () => {
  it('revelação de palavras', () => {
    expect(MOTION.words).toEqual({ duration: 1.7, staggerAmount: 0.6, ease: 'expo.out', fromY: '120%' });
  });
  it('subida com fade', () => {
    expect(MOTION.fadeUp).toEqual({ fromY: 70, duration: 2, opacityDuration: 1, stagger: 0.1, ease: 'expo.out' });
  });
  it('escala e fade simples', () => {
    expect(MOTION.scale).toEqual({ from: 0, duration: 2, stagger: 0.1, ease: 'expo.out' });
    expect(MOTION.fade).toEqual({ duration: 2, stagger: 0.1, ease: 'expo.out' });
  });
  it('painel de destaque', () => {
    expect(MOTION.panel).toEqual({
      from: 'inset(5% 10% round 2rem)', to: 'inset(0% 0% round 2rem)',
      scale: 0.9, duration: 2.5, ease: 'expo.out', opacityDuration: 1,
    });
    expect(MOTION.parallax).toEqual({ from: '-10%', to: '10%', scale: 1.05 });
  });
  it('transição de página, navbar, cursor e serviços', () => {
    expect(MOTION.loader).toEqual({ duration: 0.7, ease: 'power4.inOut', hideDuration: 0.4 });
    expect(MOTION.navbar).toEqual({ logoStagger: 0.06, logoDuration: 0.4, itemY: 20, itemStagger: 0.1, itemDuration: 0.8 });
    expect(MOTION.cursor).toEqual({ speed: 0.5, skewing: 1.5 });
    expect(MOTION.services).toEqual({ scrub: 1, startOffset: '20%', endOffset: '30%' });
  });
});
