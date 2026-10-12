import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';

describe('dados do site', () => {
  it('usa o e-mail e o nome reais', () => {
    expect(site.name).toBe('Ivy Gabriel');
    expect(site.email).toBe('ivy.gabriel@icloud.com');
  });

  it('o logo do cabeçalho é "IG"', () => {
    expect(site.wordmark).toBe('IG');
  });

  it('tem GitHub, LinkedIn e Instagram, com as URLs informadas', () => {
    expect(site.socials.map((s) => [s.id, s.url])).toEqual([
      ['github', 'https://github.com/ivygabriell'],
      ['linkedin', 'https://www.linkedin.com/in/ivygabriel'],
      ['instagram', 'https://www.instagram.com/ivygabriell_/'],
    ]);
  });

  it('o WhatsApp é só dígitos com o código do Brasil', () => {
    expect(site.whatsapp).toMatch(/^55\d{10,11}$/);
  });

  it('não contém o e-mail da conta nem o domínio de exemplo', () => {
    const dump = JSON.stringify(site).toLowerCase();
    expect(dump).not.toContain('gcivy');
    expect(dump).not.toContain('example.com');
  });
});
