import { describe, expect, it } from 'vitest';
import { whatsappUrl } from '../../src/lib/whatsapp';

describe('whatsappUrl', () => {
  it('monta o link wa.me com a mensagem codificada', () => {
    expect(whatsappUrl('5562995024778', 'Olá, Ivy!')).toBe('https://wa.me/5562995024778?text=Ol%C3%A1%2C%20Ivy!');
  });

  it('codifica caracteres que quebrariam a URL', () => {
    expect(whatsappUrl('5562995024778', 'a&b?c')).toContain('?text=a%26b%3Fc');
  });

  it('recusa número formatado ou vazio (só dígitos com código do país)', () => {
    expect(() => whatsappUrl('+55 62 99502-4778', 'x')).toThrow(/digits only/);
    expect(() => whatsappUrl('', 'x')).toThrow(/digits only/);
  });
});
