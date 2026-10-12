import { motionFlags, readEnv } from '../lib/capabilities';
import { gsap, ScrollTrigger } from './gsap';
import { mount, unmount } from './registry';
import './smooth-scroll';
import './reveal';
import './border-reveal';
import './navbar';
import './preview';
import './services';
import './work-scrub';
import './divider';
import './cursor';
import './card-video';
import './clipboard-button';
import './lang-switch';
import './loader';

interface SwapEvent extends Event {
  newDocument: Document;
}

const ROOT_CLASSES = ['js', 'motion', 'motion-failed'];
let context: gsap.Context | null = null;

function start() {
  const root = document.documentElement;
  const late = root.classList.contains('motion-failed');
  const flags = motionFlags(readEnv(window), { late });
  if (late) {
    // O timeout de segurança já mostrou tudo: não recriamos estados iniciais, só liberamos o CSS.
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => (el.dataset.revealed = '1'));
    root.classList.remove('motion-failed');
  } else {
    root.classList.toggle('motion', flags.animations);
  }
  context = gsap.context(() => mount(document, flags));
  (window as unknown as { __motionReady: boolean }).__motionReady = true;
  ScrollTrigger.refresh();
}

function stop() {
  unmount();
  context?.revert();
  context = null;
}

// O ClientRouter troca os atributos do <html>; sem isto as classes js/motion sumiriam.
document.addEventListener('astro:before-swap', (event) => {
  stop();
  const next = (event as SwapEvent).newDocument.documentElement;
  for (const name of ROOT_CLASSES)
    if (document.documentElement.classList.contains(name)) next.classList.add(name);
});

// Começa assim que o DOM está pronto (sem esperar imagens); o astro:page-load só inicia nas trocas de página.
function boot() {
  if (!context) start();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
document.addEventListener('astro:page-load', boot);
