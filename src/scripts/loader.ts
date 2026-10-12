import { motionFlags, readEnv } from '../lib/capabilities';
import { MOTION } from './motion-config';
import { gsap } from './gsap';

interface PreparationEvent extends Event {
  loader: () => Promise<void>;
}

const enabled = () => motionFlags(readEnv(window)).animations;
const parts = () => {
  const el = document.querySelector<HTMLElement>('.Loader');
  return el
    ? { el, backdrop: el.querySelector<HTMLElement>('.backdrop')!, fill: el.querySelector<HTMLElement>('.fill')! }
    : null;
};

async function show() {
  const p = parts();
  if (!p) return;
  const { duration, ease } = MOTION.loader;
  gsap.set(p.el, { display: 'block', pointerEvents: 'auto' });
  gsap.set(p.fill, { opacity: 1, scaleY: 0, transformOrigin: 'bottom' });
  await gsap
    .timeline()
    .to(p.backdrop, { opacity: 1, duration }, 0)
    .to(p.fill, { scaleY: 1, duration, ease }, 0);
}

async function hide() {
  const p = parts();
  if (!p || getComputedStyle(p.el).display === 'none') return;
  await gsap.to(p.fill, { opacity: 0, duration: MOTION.loader.hideDuration });
  gsap.set(p.el, { display: 'none', pointerEvents: 'none' });
  gsap.set(p.backdrop, { opacity: 0 });
}

// Registrado uma vez; o ClientRouter chama estes eventos a cada navegação.
document.addEventListener('astro:before-preparation', (event) => {
  if (!enabled()) return;
  const e = event as PreparationEvent;
  const original = e.loader;
  e.loader = async () => {
    await show();
    await original();
  };
});
document.addEventListener('astro:page-load', () => void hide());
