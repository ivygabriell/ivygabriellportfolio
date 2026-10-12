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

  it('o footer tem uma linha com os links à esquerda e o Contato no meio (3 colunas)', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toContain('<slot name="contact" />');
    expect(footer).toMatch(/\.top\s*\{[^}]*grid-template-columns:\s*1fr\s+minmax\(0,\s*81rem\)\s+1fr/);
    expect(footer.indexOf('class="links"')).toBeLessThan(footer.indexOf('<slot name="contact"'));
  });

  it('o bloco do Contato é centralizado no meio da linha e, no mobile, vem antes dos links', () => {
    const outro = src('components/Outro.astro');
    expect(outro).toMatch(/\.inner\s*\{[^}]*justify-items:\s*center/);
    expect(outro).toContain('text-align: center');
    expect(src('components/Footer.astro')).toMatch(/\.contact\s*\{[^}]*order:\s*-1/);
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
