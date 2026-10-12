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
