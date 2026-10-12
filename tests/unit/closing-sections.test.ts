import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const src = (path: string) => readFileSync(`src/${path}`, 'utf8');

describe('Contato dentro do footer, em uma cor só', () => {
  it('o Contato não importa nem desenha a arte de triângulos nem gradiente', () => {
    const outro = src('components/Outro.astro');
    expect(outro).not.toContain('GradientArt');
    expect(outro).not.toContain('class="art"');
    expect(outro.toLowerCase()).not.toContain('gradient');
  });

  it('o Contato não é uma seção escura própria: vive dentro do footer, que já é .-inverse', () => {
    const outro = src('components/Outro.astro');
    expect(outro).toMatch(/<section class="Outro" id="contato"/);
    expect(outro).not.toContain('-inverse');
    expect(outro).not.toMatch(/margin-top:\s*calc/);
    expect(src('components/Footer.astro')).toMatch(/<footer class:list=\{\['Footer', '-inverse'/);
  });

  it('a home coloca o Contato no slot do footer, fora do <main>', () => {
    const home = src('components/Home.astro');
    expect(home).toMatch(/<Footer[^>]*>\s*<Outro[^>]*slot="contact"/);
    const main = home.slice(home.indexOf('<main'), home.indexOf('</main>'));
    expect(main).not.toContain('<Outro');
  });

  it('o footer empilha: Contato centralizado em cima e os links embaixo, à esquerda, antes da linha', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toContain('<slot name="contact" />');
    expect(footer.indexOf('<slot name="contact"')).toBeLessThan(footer.indexOf('class="links"'));
    expect(footer.indexOf('class="links"')).toBeLessThan(footer.indexOf('<Divider'));
    expect(footer).toMatch(/\.top\s*\{[^}]*grid-template-columns:\s*1fr;/);
    expect(footer).not.toContain('minmax(0, 81rem)');
    expect(footer).not.toContain('order: -1');
    expect(footer).toMatch(/\.links\s*\{[^}]*justify-items:\s*start/);
  });

  it('o bloco do Contato é centralizado', () => {
    const outro = src('components/Outro.astro');
    expect(outro).toMatch(/\.inner\s*\{[^}]*justify-items:\s*center/);
    expect(outro).toContain('text-align: center');
    // Sem limite de largura o título quebra deixando "papel?" sozinho na segunda linha.
    expect(outro).toMatch(/h2\s*\{[^}]*max-width:\s*90rem/);
  });

  it('o footer é reto, sem e-mail próprio e sem linha de topo', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toMatch(/\.Footer\s*\{[^}]*border-radius:\s*0/);
    expect(footer).not.toContain('site.email');
    expect(footer).not.toContain('mailto:');
    expect(footer).not.toContain('border-top');
    expect(footer).not.toMatch(/\.Footer\s*\{[^}]*background/);
  });
});
