import { MOTION } from './motion-config';
import { gsap, ScrollTrigger, SplitText } from './gsap';
import { register } from './registry';

const HEADING = /^H[1-6]$/;

function revealWords(el: HTMLElement) {
  const { duration, staggerAmount, ease, fromY } = MOTION.words;
  const split = SplitText.create(el, {
    type: 'words',
    mask: 'words',
    aria: HEADING.test(el.tagName) ? 'auto' : 'none',
  });
  // Folga em volta de cada palavra para a máscara não cortar ascendentes e descendentes.
  gsap.set(split.masks, { display: 'inline-block', margin: '-0.2em', verticalAlign: 'top' });
  gsap.set(split.words, { display: 'inline-block', padding: '0.2em', y: fromY });
  const tl = gsap.timeline({ paused: true });
  tl.set(split.words, { willChange: 'transform' }, 0);
  tl.to(split.words, { y: '0%', duration, stagger: { amount: staggerAmount }, ease }, 0);
  tl.set(split.words, { willChange: 'auto' });
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => tl.play() });
}

function batchFadeUp(els: HTMLElement[]) {
  if (!els.length) return;
  const { fromY, duration, opacityDuration, stagger, ease } = MOTION.fadeUp;
  gsap.set(els, { opacity: 0, y: fromY });
  ScrollTrigger.batch(els, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      const tl = gsap.timeline();
      tl.set(batch, { willChange: 'transform' }, 0);
      tl.to(batch, { opacity: 1, duration: opacityDuration, stagger }, 0);
      tl.to(batch, { y: 0, duration, stagger, ease }, 0);
      tl.set(batch, { willChange: 'auto' });
    },
  });
}

function batchFade(els: HTMLElement[]) {
  if (!els.length) return;
  const { duration, stagger, ease } = MOTION.fade;
  gsap.set(els, { opacity: 0 });
  ScrollTrigger.batch(els, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, duration, stagger, ease }),
  });
}

function batchScale(els: HTMLElement[]) {
  if (!els.length) return;
  const { from, duration, stagger, ease } = MOTION.scale;
  gsap.set(els, { scale: from });
  ScrollTrigger.batch(els, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      const tl = gsap.timeline();
      tl.set(batch, { willChange: 'transform' }, 0);
      tl.to(batch, { scale: 1, duration, stagger, ease }, 0);
      tl.set(batch, { willChange: 'auto' });
    },
  });
}

function revealPanel(el: HTMLElement) {
  const p = MOTION.panel;
  gsap.set(el, { opacity: 0 });
  const tl = gsap.timeline({ paused: true });
  tl.set(el, { willChange: 'transform' }, 0);
  tl.fromTo(el, { clipPath: p.from, scale: p.scale }, { clipPath: p.to, scale: 1, duration: p.duration, ease: p.ease }, 0.1);
  tl.to(el, { opacity: 1, duration: p.opacityDuration }, 0.1);
  tl.set(el, { willChange: 'auto' });
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => tl.play() });
}

// Uma revelação que falha não pode deixar conteúdo escondido: limpamos o que ela aplicou e seguimos.
function safely(what: string, targets: HTMLElement[], run: () => void) {
  try {
    run();
  } catch (error) {
    console.error(`[reveal] ${what} failed`, error);
    gsap.set(targets, { clearProps: 'all' });
  }
}

register((root, flags) => {
  if (!flags.animations) return;
  const els = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
  const of = (kind: string) => els.filter((el) => el.dataset.reveal === kind);

  of('words').forEach((el) => safely('words', [el], () => revealWords(el)));
  of('panel').forEach((el) => safely('panel', [el], () => revealPanel(el)));
  safely('fade-up', of('fade-up'), () => batchFadeUp(of('fade-up')));
  safely('fade', of('fade'), () => batchFade(of('fade')));
  safely('scale', of('scale'), () => batchScale(of('scale')));

  // Só agora o CSS deixa de esconder: os estados iniciais já estão aplicados pelo GSAP.
  els.forEach((el) => (el.dataset.revealed = '1'));

  return () => els.forEach((el) => el.removeAttribute('data-revealed'));
});
