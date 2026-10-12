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

  it('o Contato não é uma seção com fundo próprio: vive dentro do footer', () => {
    const outro = src('components/Outro.astro');
    expect(outro).toMatch(/<section class="Outro" id="contato"/);
    expect(outro).not.toContain('-inverse');
    expect(outro).not.toMatch(/margin-top:\s*calc/);
    expect(src('components/Footer.astro')).toMatch(/<footer class:list=\{\['Footer', \{/);
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

  it('o bloco do Contato desce para perto dos links (pouco espaço entre eles; o topo absorve a diferença)', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toMatch(/\.top\s*\{[^}]*gap:\s*5rem;/);
    expect(footer).toMatch(/\.Footer\.-with-contact\s*\{[^}]*padding-top:\s*16rem;/);
  });

  it('o bloco do Contato é centralizado', () => {
    const outro = src('components/Outro.astro');
    expect(outro).toMatch(/\.inner\s*\{[^}]*justify-items:\s*center/);
    expect(outro).toContain('text-align: center');
    // Sem limite de largura o título quebra deixando "papel?" sozinho na segunda linha.
    expect(outro).toMatch(/h2\s*\{[^}]*max-width:\s*90rem/);
  });

  it('o footer tem cor própria (cobalto), diferente dos Serviços, e texto branco', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toMatch(/\.Footer\s*\{[^}]*background:\s*var\(--c-accent\)/);
    expect(footer).toMatch(/\.Footer\s*\{[^}]*color:\s*#fff/);
    expect(footer).not.toContain('-inverse');
    expect(src('components/Work.astro')).toContain('class="Work -inverse"');
  });

  it('o footer não tem e-mail próprio nem linha de topo', () => {
    const footer = src('components/Footer.astro');
    expect(footer).not.toContain('site.email');
    expect(footer).not.toContain('mailto:');
    expect(footer).not.toContain('border-top');
  });

  it('o botão claro do Contato tem hover escuro no footer cobalto (senão o preenchimento some no fundo)', () => {
    expect(src('components/Outro.astro')).toMatch(/:global\(\.Pill\.-light\)\s*\{[^}]*--pill-hover-bg:\s*var\(--c-ink\)/);
  });

  it('o footer é baixo ("achatado"): espaçamentos verticais enxutos no desktop e no mobile', () => {
    const footer = src('components/Footer.astro');
    expect(footer).toMatch(/\.Footer\s*\{[^}]*padding-block:\s*5rem;/);
    expect(footer).toMatch(/\.rule\s*\{[^}]*margin-top:\s*4rem;/);
    expect(footer).toMatch(/\.bottom\s*\{[^}]*margin-top:\s*5rem;/);
    expect(footer).toMatch(/\.links\s*\{[^}]*gap:\s*1\.2rem;/);
    expect(src('components/Outro.astro')).toMatch(/\.inner\s*\{[^}]*gap:\s*3rem;/);
    // mobile
    expect(footer).toMatch(/@media[^{]*\{[\s\S]*\.Footer\.-with-contact\s*\{[^}]*padding-top:\s*11rem;/);
  });
});
