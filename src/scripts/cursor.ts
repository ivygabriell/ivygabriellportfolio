import { ICONS, resolveCursorState, type CursorIcon } from '../lib/cursor-state';
import { MOTION } from './motion-config';
import { gsap } from './gsap';
import { register } from './registry';

// O cursor persiste entre páginas, mas o revert do GSAP zera x/y: lembramos o último ponteiro para retomar dali.
const pointer = { x: -1, y: -1 };
document.addEventListener(
  'pointermove',
  (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  },
  { passive: true },
);

register((_root, flags) => {
  if (!flags.cursor) return;
  const el = document.querySelector<HTMLElement>('.Cursor');
  const iconBox = el?.querySelector<HTMLElement>('.Cursor__icon');
  if (!el || !iconBox) return;

  const { speed, skewing } = MOTION.cursor;
  if (pointer.x >= 0) gsap.set(el, { x: pointer.x, y: pointer.y });
  const setX = gsap.quickTo(el, 'x', { duration: speed, ease: 'power3.out' });
  const setY = gsap.quickTo(el, 'y', { duration: speed, ease: 'power3.out' });
  let last = { x: 0, y: 0, t: 0 };
  let shown: CursorIcon | null = null;

  const setIcon = (icon: CursorIcon | null) => {
    if (icon === shown) return;
    shown = icon;
    el.classList.toggle('-icon', icon !== null);
    if (icon) iconBox.innerHTML = ICONS[icon];
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    el.classList.add('-visible');
    setX(event.clientX);
    setY(event.clientY);

    const now = performance.now();
    const dt = Math.max(now - last.t, 1);
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    const velocity = Math.hypot(dx, dy) / dt;
    last = { x: event.clientX, y: event.clientY, t: now };
    if (velocity > 0.05) {
      const stretch = Math.min(velocity * 0.12 * skewing, 0.6);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      gsap.to(el, {
        rotation: angle,
        scaleX: 1 + stretch,
        scaleY: 1 - stretch * 0.4,
        duration: 0.15,
        overwrite: 'auto',
      });
      // O ícone contra-gira para ficar sempre em pé; ao parar, tudo volta ao repouso.
      gsap.to(iconBox, { rotation: -angle, duration: 0.15, overwrite: 'auto' });
      gsap.to(el, { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.5, delay: 0.1, overwrite: 'auto' });
      gsap.to(iconBox, { rotation: 0, duration: 0.5, delay: 0.1, overwrite: 'auto' });
    }
    setIcon(resolveCursorState(event.target as Element | null).icon);
  };
  const onLeave = () => el.classList.remove('-visible');

  document.addEventListener('pointermove', onMove);
  document.documentElement.addEventListener('mouseleave', onLeave);

  return () => {
    document.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('mouseleave', onLeave);
    setIcon(null);
    el.classList.remove('-visible');
  };
});
