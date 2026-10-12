import { nextNavState, type NavState } from '../lib/nav-state';
import { MOTION } from './motion-config';
import { gsap } from './gsap';
import { register } from './registry';

register((root, flags) => {
  const header = root.querySelector<HTMLElement>('.Navbar');
  if (!header) return;

  // Estado fixo (some ao descer, volta ao subir)
  let state: NavState = { fixed: false, visible: false };
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    state = nextNavState(y, lastY, state);
    lastY = y;
    header.classList.toggle('-fixed', state.fixed);
    header.classList.toggle('-visible', state.visible);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu do mobile
  const toggle = header.querySelector<HTMLButtonElement>('.toggle');
  const setOpen = (open: boolean) => {
    header.classList.toggle('-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
  };
  const onToggle = () => setOpen(!header.classList.contains('-open'));
  const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
  const onLink = (event: Event) => {
    if ((event.target as Element).closest('a')) setOpen(false);
  };
  toggle?.addEventListener('click', onToggle);
  header.addEventListener('click', onLink);
  document.addEventListener('keydown', onKey);

  // Entrada: letras do logo e itens da barra
  if (flags.animations) {
    const n = MOTION.navbar;
    const tl = gsap.timeline();
    tl.fromTo(
      header.querySelectorAll('.logo__ch'),
      { scale: 0, transformOrigin: 'center center' },
      { scale: 1, duration: n.logoDuration, stagger: n.logoStagger },
      0,
    );
    if (window.innerWidth >= 768) {
      tl.fromTo(
        header.querySelectorAll('.nav, .action'),
        { y: n.itemY, opacity: 0 },
        { y: 0, opacity: 1, duration: n.itemDuration, stagger: n.itemStagger, clearProps: 'all' },
        0,
      );
    }
  }

  return () => {
    window.removeEventListener('scroll', onScroll);
    toggle?.removeEventListener('click', onToggle);
    header.removeEventListener('click', onLink);
    document.removeEventListener('keydown', onKey);
    header.classList.remove('-fixed', '-visible', '-open');
    document.documentElement.classList.remove('menu-open');
  };
});
