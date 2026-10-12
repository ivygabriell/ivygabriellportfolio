import { MOTION } from './motion-config';
import { getLenis } from './smooth-scroll';
import { gsap } from './gsap';
import { register } from './registry';

register((root, flags) => {
  // Paralaxe da mídia dentro de cada painel
  if (flags.animations) {
    const p = MOTION.parallax;
    root.querySelectorAll<HTMLElement>('.Preview .main').forEach((main) => {
      const media = main.querySelector<HTMLElement>('.media');
      if (!media) return;
      gsap.fromTo(
        media,
        { y: p.from, scale: p.scale },
        { y: p.to, ease: 'none', scrollTrigger: { trigger: main, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
  }

  // Modal do vídeo de destaque (só existe quando site.highlightVideo está definido)
  const dialog = root.querySelector<HTMLDialogElement>('#showreel-modal');
  const opener = root.querySelector<HTMLElement>('#destaque .main[data-cursor-icon="play"]');
  if (!dialog || !opener) return;
  const video = dialog.querySelector('video');
  const open = () => {
    dialog.showModal();
    getLenis()?.stop();
    void video?.play()?.catch(() => {});
  };
  const close = () => dialog.close();
  const onClosed = () => {
    video?.pause();
    getLenis()?.start();
  };
  opener.addEventListener('click', open);
  dialog.addEventListener('click', close);
  dialog.addEventListener('close', onClosed);
  return () => {
    opener.removeEventListener('click', open);
    dialog.removeEventListener('click', close);
    dialog.removeEventListener('close', onClosed);
    if (dialog.open) dialog.close();
  };
});
