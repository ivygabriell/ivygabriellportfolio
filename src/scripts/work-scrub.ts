import { gsap, ScrollTrigger } from './gsap';
import { register } from './registry';

// Cartões de Selected work acendem conforme cruzam a tela (scrub 1, como os cartões de Features do Cuberto).
const SCRUB = { scrub: 1, start: 'top 90%', end: 'center 55%', dim: 0.35, mediaScale: 0.94 } as const;

register((root, flags) => {
  if (!flags.animations) return;
  const cards = [...root.querySelectorAll<HTMLElement>('.Work .Card')];
  if (!cards.length) return;

  // Desktop apenas: no mobile o Cuberto também não usa scrub.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 768px)', () => {
    for (const card of cards) {
      const media = card.querySelector('.Card__media');
      const copy = card.querySelectorAll('.Card__title, .Card__text');
      const tl = gsap.timeline();
      tl.fromTo(media, { opacity: SCRUB.dim, scale: SCRUB.mediaScale }, { opacity: 1, scale: 1, ease: 'none' }, 0);
      tl.fromTo(copy, { opacity: SCRUB.dim }, { opacity: 1, ease: 'none' }, 0);
      ScrollTrigger.create({ trigger: card, start: SCRUB.start, end: SCRUB.end, scrub: SCRUB.scrub, animation: tl });
    }
  });
  return () => mm.revert();
});
