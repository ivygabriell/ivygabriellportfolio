// Dados de contato reais. Mantenha `example: true` até aprovar os textos publicados:
// enquanto for true, as páginas levam `noindex`.
export const site = {
  name: 'Ivy Gabriel',
  wordmark: 'ivy',
  email: 'ivy.gabriel@icloud.com',
  // Só dígitos, com o código do país. Aparece apenas dentro do link do botão (wa.me), nunca como texto.
  whatsapp: '5562995024778',
  example: true,
  socials: [
    { id: 'github', label: 'GitHub', short: 'GH', url: 'https://github.com/ivygabriell' },
    { id: 'linkedin', label: 'LinkedIn', short: 'IN', url: 'https://www.linkedin.com/in/ivygabriel' },
  ],
  // Caminho de um vídeo curto (ex.: '/media/destaque.mp4') ou null para só o painel em código.
  highlightVideo: null as string | null,
};
