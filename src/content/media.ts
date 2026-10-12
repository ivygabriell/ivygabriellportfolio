// Vídeos do site (sem áudio, H.264). Cada vídeo tem uma capa .jpg (o primeiro quadro) em public/media/.
// Para trocar um vídeo: substitua o .mp4 e gere a capa de novo, por exemplo:
//   ffmpeg -i novo.mp4 -frames:v 1 -vf scale=720:-2 -q:v 5 public/media/<nome>.jpg   (use scale=1280 no 16:9)
// As capas são pequenas de propósito: o navegador as baixa junto com a página.
export interface Clip {
  video: string;
  poster: string;
}

const clip = (name: string): Clip => ({ video: `/media/${name}.mp4`, poster: `/media/${name}.jpg` });

export const media = {
  // Painel do Destaque: 16:9 no desktop, 4:5 no celular (o painel vira 4:5 até 767px).
  highlight: { desktop: clip('destaque-16x9'), mobile: clip('destaque-4x5') },
  // Um por cartão de Serviços, na mesma ordem de `services.items` nos textos.
  services: [clip('card-websites'), clip('card-webapps'), clip('card-mobile'), clip('card-automations')],
} as const;
