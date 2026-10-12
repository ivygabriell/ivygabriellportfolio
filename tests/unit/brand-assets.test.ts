import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

describe('assets da marca', () => {
  it('a imagem de compartilhamento tem 1200x630', async () => {
    const meta = await sharp('public/og-cover.png').metadata();
    expect([meta.width, meta.height]).toEqual([1200, 630]);
  });

  it('a imagem de compartilhamento foi gerada na paleta cobalto (base azul vivo)', async () => {
    const { data, info } = await sharp('public/og-cover.png').raw().toBuffer({ resolveWithObject: true });
    const x = 600;
    const y = 625;
    const i = (y * info.width + x) * info.channels;
    expect(data[i + 2], 'canal azul na base da imagem').toBeGreaterThan(200);
  });

  it('o favicon e o gerador usam o cobalto e não o índigo antigo', () => {
    const favicon = readFileSync('public/favicon.svg', 'utf8').toLowerCase();
    const gen = readFileSync('scripts/gen-og.mjs', 'utf8').toLowerCase();
    expect(favicon).toContain('#1f4fff');
    expect(gen).toContain('#1f4fff');
    expect(gen).not.toContain('#4338ca');
  });
});
