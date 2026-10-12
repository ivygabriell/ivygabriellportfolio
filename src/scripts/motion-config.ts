// Valores medidos no CSS/JS público do Cuberto (ver spec, "Animações e interações").
export const MOTION = {
  words: { duration: 1.7, staggerAmount: 0.6, ease: 'expo.out', fromY: '120%' },
  fadeUp: { fromY: 70, duration: 2, opacityDuration: 1, stagger: 0.1, ease: 'expo.out' },
  fade: { duration: 2, stagger: 0.1, ease: 'expo.out' },
  scale: { from: 0, duration: 2, stagger: 0.1, ease: 'expo.out' },
  panel: {
    from: 'inset(5% 10% round 2rem)',
    to: 'inset(0% 0% round 2rem)',
    scale: 0.9,
    duration: 2.5,
    ease: 'expo.out',
    opacityDuration: 1,
  },
  parallax: { from: '-10%', to: '10%', scale: 1.05 },
  loader: { duration: 0.7, ease: 'power4.inOut', hideDuration: 0.4 },
  navbar: { logoStagger: 0.06, logoDuration: 0.4, itemY: 20, itemStagger: 0.1, itemDuration: 0.8 },
  cursor: { speed: 0.5, skewing: 1.5 },
  services: { scrub: 1, startOffset: '20%', endOffset: '30%' },
} as const;
