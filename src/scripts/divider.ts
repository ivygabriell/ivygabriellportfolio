import { controlPoint, dividerPath } from '../lib/divider-path';
import { gsap, ScrollTrigger } from './gsap';
import { register } from './registry';

// Valores medidos no Cuberto: entrada scaleX 3s expo.out; segue o mouse em 0,2s; volta elástica em 2s.
const ENTRY = { duration: 3, ease: 'expo.out' } as const;
const FOLLOW = { duration: 0.2 } as const;
const RETURN = { duration: 2, ease: 'elastic.out(1, 0.2)' } as const;
const SVG_NS = 'http://www.w3.org/2000/svg';

register((root, flags) => {
  const dividers = [...root.querySelectorAll<HTMLElement>('.Divider')];
  const cleanups: (() => void)[] = [];

  for (const el of dividers) {
    const doc = el.ownerDocument;
    const svg = doc.createElementNS(SVG_NS, 'svg');
    const path = doc.createElementNS(SVG_NS, 'path');
    svg.append(path);
    el.append(svg);
    el.classList.add('is-live');

    const rest = () => dividerPath(el.offsetWidth);
    path.setAttribute('d', rest());

    if (flags.animations) {
      gsap.set(svg, { transformOrigin: 'left center' });
      const tl = gsap.timeline();
      tl.from(svg, { scaleX: 0, duration: ENTRY.duration, ease: ENTRY.ease });
      ScrollTrigger.create({ trigger: el, animation: tl });
    }

    if (flags.cursor) {
      let bias = 0;
      const onMove = (event: MouseEvent) => {
        const box = (svg as unknown as Element).getBoundingClientRect();
        const point = controlPoint(event.clientX - box.left, event.clientY - box.top, bias);
        bias = point.bias;
        gsap.to(path, { attr: { d: dividerPath(el.offsetWidth, point.x, point.y) }, duration: FOLLOW.duration, overwrite: true });
      };
      const onLeave = () => {
        bias = 0;
        gsap.to(path, { attr: { d: rest() }, duration: RETURN.duration, ease: RETURN.ease });
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    }

    if (typeof ResizeObserver !== 'undefined') {
      let timer = 0;
      const observer = new ResizeObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          gsap.killTweensOf(path);
          path.setAttribute('d', rest());
        }, 30);
      });
      observer.observe(el);
      cleanups.push(() => {
        window.clearTimeout(timer);
        observer.disconnect();
      });
    }

    cleanups.push(() => {
      svg.remove?.();
      el.classList.remove('is-live');
    });
  }

  return () => cleanups.forEach((cleanup) => cleanup());
});
