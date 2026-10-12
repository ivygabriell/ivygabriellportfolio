import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { site } from '../../src/content/site';

const icon = readFileSync('src/components/SocialIcon.astro', 'utf8');

describe('ícones das redes', () => {
  it.each(site.socials.map((s) => s.id))('há um ícone para "%s"', (id) => {
    expect(icon).toContain(`'${id}'`);
  });

  it('uma rede sem ícone derruba o build em vez de aparecer vazia', () => {
    expect(icon).toMatch(/throw new Error\(/);
  });

  it('o ícone é decorativo: o nome acessível vem do aria-label do link', () => {
    expect(icon).toContain('aria-hidden="true"');
  });

  it('as redes não carregam mais as siglas GH/IN/IG', () => {
    for (const social of site.socials) expect(social).not.toHaveProperty('short');
  });
});
