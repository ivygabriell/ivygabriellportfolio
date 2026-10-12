import { browserDeps, copyText } from '../lib/clipboard';
import { register } from './registry';

register((root) => {
  const cleanups: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('[data-clipboard-copy]').forEach((button) => {
    const label = button.querySelector<HTMLElement>('.Pill__label') ?? button;
    const original = label.textContent ?? '';
    let timer = 0;
    const onClick = async (event: Event) => {
      event.preventDefault();
      const text = button.dataset.clipboardCopy ?? '';
      const ok = await copyText(text, browserDeps());
      window.clearTimeout(timer);
      if (ok) {
        button.classList.add('-alt');
        label.textContent = button.dataset.copied ?? original;
      } else {
        button.classList.add('-failed');
        label.textContent = `${button.dataset.failed ?? ''} ${text}`.trim();
      }
      timer = window.setTimeout(() => {
        button.classList.remove('-alt', '-failed');
        label.textContent = original;
      }, ok ? 1000 : 4000);
    };
    button.addEventListener('click', onClick);
    cleanups.push(() => {
      window.clearTimeout(timer);
      button.removeEventListener('click', onClick);
      label.textContent = original;
    });
  });
  return () => cleanups.forEach((c) => c());
});
