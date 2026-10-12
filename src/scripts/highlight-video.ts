import { register } from './registry';

// O painel do Destaque tem a capa (<picture>) no HTML e, por cima, um vídeo em loop: 16:9 no desktop e
// 4:5 até 767px (o painel muda de proporção). A escolha é feita aqui porque o atributo `media` de
// <source> não vale para <video> nos navegadores.
// Para não competir com a carga da página (LCP), o vídeo só começa a baixar 3 s depois do `load` ou na
// primeira interação do visitante (o que vier primeiro) e quando o painel está perto da tela.
// Com movimento reduzido ficam só as capas.
const SETTLE_MS = 3000;
const INTERACTIONS = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'] as const;

register((root, flags) => {
  const video = root.querySelector<HTMLVideoElement>('video[data-src-desktop]');
  if (!video || !flags.animations) return;
  const { srcDesktop = '', srcMobile = '' } = video.dataset;
  const query = window.matchMedia('(max-width: 767px)');

  let started = false;
  let armed = false;
  let timer = 0;
  let observer: IntersectionObserver | undefined;

  const apply = () => {
    const src = query.matches ? srcMobile : srcDesktop;
    if (video.getAttribute('src') !== src) video.src = src;
    void video.play()?.catch(() => {});
  };
  const start = () => {
    started = true;
    apply();
  };
  const watch = () => {
    if (typeof IntersectionObserver === 'undefined') return start();
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        start();
      },
      { rootMargin: '200px' },
    );
    observer.observe(video);
  };
  const disarm = () => {
    window.clearTimeout(timer);
    for (const event of INTERACTIONS) window.removeEventListener(event, arm);
  };
  function arm() {
    if (armed) return;
    armed = true;
    disarm();
    watch();
  }
  const afterLoad = () => {
    timer = window.setTimeout(arm, SETTLE_MS);
    for (const event of INTERACTIONS) window.addEventListener(event, arm, { once: true, passive: true });
  };
  const onChange = () => {
    if (started) apply();
  };
  // O vídeo fica invisível até começar a tocar (a capa aparece por baixo): sem piscar nem quadro preto.
  const onPlaying = () => video.classList.add('is-playing');

  video.addEventListener('playing', onPlaying);
  query.addEventListener('change', onChange);
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });

  return () => {
    window.removeEventListener('load', afterLoad);
    disarm();
    query.removeEventListener('change', onChange);
    video.removeEventListener('playing', onPlaying);
    observer?.disconnect();
    video.pause();
  };
});
