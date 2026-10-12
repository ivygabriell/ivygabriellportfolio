import { register } from './registry';

// Com mouse, quem toca o vídeo do cartão é o card-video.ts (hover, como no Cuberto).
// Em dispositivos de toque não existe hover: o vídeo toca enquanto o cartão está na tela.
// Com movimento reduzido ficam só as capas.
register((root, flags) => {
  if (flags.cursor || !flags.animations) return;
  if (typeof IntersectionObserver === 'undefined') return;
  const videos = [...root.querySelectorAll<HTMLVideoElement>('.Work .Card video')];
  if (!videos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) void video.play()?.catch(() => {});
        else video.pause();
      }
    },
    { threshold: 0.5 },
  );
  videos.forEach((video) => observer.observe(video));
  return () => {
    observer.disconnect();
    videos.forEach((video) => video.pause());
  };
});
