import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { site } from '../../src/content/site';
import { whatsappUrl } from '../../src/lib/whatsapp';
import { readDecoded } from './dist';

describe('contato', () => {
  it.each([['pt', pt], ['en', en]] as const)('%s: botão de WhatsApp com a mensagem no idioma da página', (lang, t) => {
    const html = readDecoded(`${lang}/index.html`);
    expect(html).toContain(`href="${whatsappUrl(site.whatsapp, t.outro.whatsappMessage)}"`);
    expect(html).toContain(t.outro.whatsappCta);
  });

  it('o número de WhatsApp só aparece dentro do href do botão', () => {
    for (const lang of ['pt', 'en']) {
      const withoutLinks = readDecoded(`${lang}/index.html`).replace(/href="https:\/\/wa\.me\/[^"]*"/g, '');
      expect(withoutLinks).not.toContain(site.whatsapp);
      expect(withoutLinks).not.toContain('99502');
      expect(withoutLinks).not.toContain('95024778');
    }
  });

  it('o e-mail novo aparece e o de exemplo e o da conta não', () => {
    for (const lang of ['pt', 'en']) {
      const html = readDecoded(`${lang}/index.html`).toLowerCase();
      expect(html).toContain(site.email);
      expect(html).not.toContain('ola@example.com');
      expect(html).not.toContain('gcivy');
    }
  });

  it.each(['pt', 'en'])('%s: o Instagram aparece no Sobre e no footer, com o link informado e sem o link de exemplo', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    const links = html.match(/href="https:\/\/www\.instagram\.com\/ivygabriell_\/"/g) ?? [];
    expect(links).toHaveLength(2);
    expect(html).not.toContain('href="https://www.instagram.com/"');
  });
});

describe('fechamento da página', () => {
  it.each(['pt', 'en'])('%s: no footer os links vêm primeiro (à esquerda), o Contato ao lado e a linha divisória por último', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    const footerAt = html.indexOf('<footer');
    const links = html.indexOf('class="links', footerAt);
    const contato = html.indexOf('id="contato"', footerAt);
    const divider = html.indexOf('class="Divider', footerAt);
    expect(footerAt).toBeGreaterThan(-1);
    expect(links).toBeGreaterThan(footerAt);
    expect(contato).toBeGreaterThan(links);
    expect(divider).toBeGreaterThan(contato);
    expect(html.slice(html.indexOf('</main>') + '</main>'.length, footerAt).trim()).toBe('');
  });

  it.each(['pt', 'en'])('%s: o bloco do Contato não tem arte em SVG (triângulos)', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    const block = html.slice(html.indexOf('id="contato"'), html.indexOf('class="Divider'));
    expect(block).not.toContain('<svg');
  });

  it.each(['pt', 'en'])('%s: a linha do footer usa o mesmo recuo do Sobre (container--narrow)', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    const footer = html.slice(html.indexOf('<footer'));
    expect(footer).toMatch(/class="container--narrow[^"]*\btop\b/);
    expect(footer).not.toMatch(/class="container[ "]/);
  });
});

describe('ícones das redes no footer', () => {
  it.each(['pt', 'en'])('%s: cada rede é um círculo com ícone SVG decorativo e nome acessível, sem siglas', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    const footer = html.slice(html.indexOf('<footer'));
    const circles = [...footer.matchAll(/<a[^>]*class="circle[^"]*"[^>]*>([\s\S]*?)<\/a>/g)];
    expect(circles).toHaveLength(site.socials.length);
    circles.forEach((circle, i) => {
      expect(circle[0]).toContain(`aria-label="${site.socials[i].label}"`);
      expect(circle[1]).toContain('<svg');
      expect(circle[1]).toContain('aria-hidden="true"');
      expect(circle[1].replace(/<svg[\s\S]*?<\/svg>/g, '').trim()).toBe('');
    });
  });
});

describe('cursor em botões', () => {
  it.each(['pt', 'en'])('%s: botões (pílulas e círculos das redes) não abrem a bola com seta; links de texto abrem', (lang) => {
    const html = readDecoded(`${lang}/index.html`);
    const buttons = [...html.matchAll(/<(?:a|button)\b[^>]*class="[^"]*\b(?:Pill|circle)\b[^"]*"[^>]*>/g)].map((m) => m[0]);
    expect(buttons.length).toBeGreaterThanOrEqual(5);
    for (const tag of buttons) expect(tag, tag).not.toContain('data-cursor-icon');
    const aboutLinks = html.slice(html.indexOf('id="sobre"'), html.indexOf('id="servicos"')).match(/data-cursor-icon="arrow-up-right"/g) ?? [];
    expect(aboutLinks.length).toBe(site.socials.length);
  });
});

