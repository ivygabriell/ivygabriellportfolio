import { gsap, ScrollTrigger } from './gsap';
import { register } from './registry';

// Linha sob os títulos: scaleX 0 → 1 em 1,5s, expo.out (medido no Cuberto).
const BORDER = { duration: 1.5, ease: 'expo.out', start: 'top 92%' } as const;

register((root, flags) => {
  if (!flags.animations) return;
  const lines = [...root.querySelectorAll<HTMLElement>('[data-reveal="border"]')];
  for (const line of lines) {
    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    ScrollTrigger.create({
      trigger: line,
      start: BORDER.start,
      once: true,
      onEnter: () => gsap.to(line, { scaleX: 1, duration: BORDER.duration, ease: BORDER.ease }),
    });
  }
});
