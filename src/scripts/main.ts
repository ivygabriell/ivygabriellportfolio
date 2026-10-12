import { motionFlags, readEnv } from '../lib/capabilities';
import { gsap, ScrollTrigger } from './gsap';
import { mount, unmount } from './registry';
import './smooth-scroll';
import './reveal';
import './navbar';
import './preview';
import './services';
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
  const flags = motionFlags(readEnv(window));
  document.documentElement.classList.toggle('motion', flags.animations);
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

document.addEventListener('astro:page-load', start);
