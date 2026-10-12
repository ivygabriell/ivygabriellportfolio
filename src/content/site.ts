// EXEMPLO: troque e-mail e redes pelos seus e ponha `example` em false.
export const site = {
  name: 'Ivy Gabriel',
  wordmark: 'ivy',
  email: 'ola@example.com',
  example: true,
  socials: [
    { id: 'github', label: 'GitHub', short: 'GH', url: 'https://github.com/' },
    { id: 'linkedin', label: 'LinkedIn', short: 'IN', url: 'https://www.linkedin.com/' },
    { id: 'instagram', label: 'Instagram', short: 'IG', url: 'https://www.instagram.com/' },
  ],
  // Caminho de um vídeo curto (ex.: '/media/destaque.mp4') ou null para só o painel em código.
  highlightVideo: null as string | null,
};
