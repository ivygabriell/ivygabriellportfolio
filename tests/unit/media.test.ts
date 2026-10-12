import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../../src/content/en.json';
import pt from '../../src/content/pt.json';
import { media } from '../../src/content/media';

const clips = [media.highlight.desktop, media.highlight.mobile, ...media.services];
const sizeMB = (path: string) => statSync(`public${path}`).size / 1024 / 1024;

describe('mídia dos vídeos', () => {
  it('há um vídeo por serviço, na mesma ordem dos cartões', () => {
    expect(media.services).toHaveLength(pt.services.items.length);
    expect(media.services).toHaveLength(en.services.items.length);
    expect(media.services.map((c) => c.video)).toEqual([
      '/media/card-websites.mp4',
      '/media/card-webapps.mp4',
      '/media/card-mobile.mp4',
      '/media/card-automations.mp4',
    ]);
  });

  it('o Destaque tem uma versão para desktop (16:9) e uma para celular (4:5)', () => {
    expect(media.highlight.desktop.video).toBe('/media/destaque-16x9.mp4');
    expect(media.highlight.mobile.video).toBe('/media/destaque-4x5.mp4');
  });

  it.each(clips.flatMap((c) => [c.video, c.poster]))('o arquivo %s existe em public/', (path) => {
    expect(existsSync(`public${path}`), path).toBe(true);
  });

  it('vídeos são .mp4 e capas são .jpg', () => {
    for (const c of clips) {
      expect(c.video.endsWith('.mp4'), c.video).toBe(true);
      expect(c.poster.endsWith('.jpg'), c.poster).toBe(true);
    }
  });

  it('o peso fica razoável: cada vídeo até 6 MB, cada capa até 300 KB e tudo até 25 MB', () => {
    let total = 0;
    for (const c of clips) {
      expect(sizeMB(c.video), c.video).toBeLessThanOrEqual(6);
      expect(sizeMB(c.poster) * 1024, c.poster).toBeLessThanOrEqual(300);
      total += sizeMB(c.video) + sizeMB(c.poster);
    }
    expect(total).toBeLessThanOrEqual(25);
  });
});
