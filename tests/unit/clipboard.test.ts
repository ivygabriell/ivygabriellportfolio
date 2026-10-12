import { describe, expect, it, vi } from 'vitest';
import { copyText } from '../../src/lib/clipboard';

describe('copyText', () => {
  it('usa a API moderna quando funciona', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await copyText('a@b.c', { writeText })).toBe(true);
    expect(writeText).toHaveBeenCalledWith('a@b.c');
  });

  it('cai para a cópia antiga quando a API moderna rejeita (permissão negada)', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const legacyCopy = vi.fn().mockReturnValue(true);
    expect(await copyText('a@b.c', { writeText, legacyCopy })).toBe(true);
    expect(legacyCopy).toHaveBeenCalledWith('a@b.c');
  });

  it('cai para a cópia antiga quando não há API moderna (http, navegador antigo)', async () => {
    const legacyCopy = vi.fn().mockReturnValue(true);
    expect(await copyText('a@b.c', { legacyCopy })).toBe(true);
  });

  it('devolve false, sem lançar, quando nada funciona', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const legacyCopy = vi.fn(() => {
      throw new Error('no execCommand');
    });
    await expect(copyText('a@b.c', { writeText, legacyCopy })).resolves.toBe(false);
    await expect(copyText('a@b.c', {})).resolves.toBe(false);
  });
});
