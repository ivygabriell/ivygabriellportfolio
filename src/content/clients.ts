// Depoimentos da seção "Quem confia no meu trabalho" (como "Trusted by our clients" do Cuberto).
// Os 5 de hoje são FICTÍCIOS: marcas inventadas e logos gerados por scripts/gen-client-logos.mjs.
// O texto de cada depoimento fica em pt.json/en.json (`clients.items`, na mesma ordem desta lista).
// Para pôr os reais: troque o SVG em public/media/clients/, ajuste `name`, o texto nos dois JSONs e ponha
// `example: false`. Com `site.example: false` os testes recusam depoimentos fictícios.
export interface Testimonial {
  id: string;
  name: string;
  logo: string;
  example: boolean;
}

const fake = (id: string, name: string): Testimonial => ({
  id,
  name,
  logo: `/media/clients/${id}.svg`,
  example: true,
});

export const testimonials: Testimonial[] = [
  fake('lumora', 'Lumora'),
  fake('brisa-pay', 'Brisa Pay'),
  fake('vertix', 'Vertix'),
  fake('nimbo', 'Nimbo'),
  fake('kairo', 'Kairo'),
];
