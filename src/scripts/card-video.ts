import { register } from './registry';

register((root, flags) => {
  if (!flags.cursor) return;
  const cleanups: (() => void)[] = [];
  root.querySelectorAll<HTMLElement>('.Card').forEach((card) => {
    const video = card.querySelector('video');
    if (!video) return;
    const play = () => {
      video.currentTime = 0;
      void video.play()?.catch(() => {});
    };
    const pause = () => video.pause();
    card.addEventListener('mouseenter', play);
    card.addEventListener('mouseleave', pause);
    cleanups.push(() => {
      card.removeEventListener('mouseenter', play);
      card.removeEventListener('mouseleave', pause);
      video.pause();
    });
  });
  return () => cleanups.forEach((c) => c());
});
