import { MOTION } from './motion-config';
import { gsap, ScrollTrigger } from './gsap';
import { register } from './registry';

register((root, flags) => {
  const section = root.querySelector<HTMLElement>('.Services');
  const wrapper = section?.querySelector<HTMLElement>('.items');
  if (!section || !wrapper || !flags.animations) return;

  const items = [...wrapper.querySelectorAll<HTMLElement>('.item')];
  const mm = gsap.matchMedia();

  // Desktop: cartões abrem e escurecem conforme a rolagem (scrub).
  mm.add('(min-width: 768px)', () => {
    section.classList.add('is-scrub');

    let tops: number[] = [];
    let bottoms: number[] = [];

    const timelines = items.slice(1).map((item, k) => {
      const q = (selector: string) => item.querySelector(selector);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          scrub: MOTION.services.scrub,
          invalidateOnRefresh: true,
          start: () => `top+=${tops[k + 1] ?? 0} center+=${MOTION.services.startOffset}`,
          end: () => `top+=${bottoms[k + 1] ?? 0} center+=${MOTION.services.endOffset}`,
        },
      });
      tl.to(item, { color: '#fff', duration: 1 }, 0);
      tl.to(q('.item__fill'), { backgroundColor: '#000', duration: 1 }, 0);
      tl.to(q('.item__bg'), { opacity: 1, duration: 1, ease: 'none' }, 0);
      tl.fromTo(q('.item__accordion'), { gridTemplateRows: '0fr' }, { gridTemplateRows: '1fr', duration: 1, ease: 'none' }, 0);
      tl.to(q('.item__content'), { opacity: 1, duration: 0.6 }, 0.4);
      tl.to(q('.item__num'), { opacity: 0.5, duration: 1 }, 0);
      tl.set(q('.item__inner'), { visibility: 'visible' }, 0.05);
      return tl;
    });

    // Mede a geometria com tudo fechado (estado inicial) e reserva a altura final,
    // para a página não "pular" enquanto os cartões abrem.
    const measure = () => {
      wrapper.style.minHeight = '';
      const progress = timelines.map((tl) => tl.progress());
      timelines.forEach((tl) => tl.progress(0));
      const box = wrapper.getBoundingClientRect();
      tops = items.map((item) => item.getBoundingClientRect().top - box.top);
      bottoms = items.map((item) => item.getBoundingClientRect().bottom - box.top);
      timelines.forEach((tl) => tl.progress(1));
      wrapper.style.minHeight = `${wrapper.scrollHeight}px`;
      timelines.forEach((tl, k) => tl.progress(progress[k]));
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', measure);
      wrapper.style.minHeight = '';
      section.classList.remove('is-scrub');
    };
  });

  // Mobile: acordeão por clique ou teclado; o primeiro cartão começa aberto.
  mm.add('(max-width: 767px)', () => {
    section.classList.add('is-accordion');
    items[0]?.classList.add('-active');
    const cleanups = items.map((item) => {
      const head = item.querySelector<HTMLElement>('.item__head')!;
      // O botão é o texto dentro do h3: o título continua sendo um título para leitores de tela.
      const button = item.querySelector<HTMLElement>('.item__toggle')!;
      const panelId = item.querySelector('.item__accordion')?.id ?? '';
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
      button.setAttribute('aria-controls', panelId);
      button.setAttribute('aria-expanded', String(item.classList.contains('-active')));
      const toggle = () => {
        const active = item.classList.toggle('-active');
        button.setAttribute('aria-expanded', String(active));
        window.setTimeout(() => ScrollTrigger.refresh(), 1300);
      };
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      };
      head.addEventListener('click', toggle);
      button.addEventListener('keydown', onKey);
      return () => {
        head.removeEventListener('click', toggle);
        button.removeEventListener('keydown', onKey);
        ['role', 'tabindex', 'aria-expanded', 'aria-controls'].forEach((a) => button.removeAttribute(a));
        item.classList.remove('-active');
      };
    });
    return () => {
      cleanups.forEach((c) => c());
      section.classList.remove('is-accordion');
    };
  });

  return () => mm.revert();
});
