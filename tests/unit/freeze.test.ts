import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// SHA-256 dos arquivos de movimento no commit 9ba438a. Mudanças aprovadas pela usuária, normalizadas abaixo:
// - services.ts: destino da animação '#0b1330' no lugar de '#000' (cor da paleta nova);
// - main.ts: três imports dos scripts novos (border-reveal, work-scrub, divider).
// Os scripts novos (ADDED) entram na lista de arquivos esperados, mas não têm hash congelado.
const FROZEN: Record<string, string> = {
  'card-video.ts': '5d627e670cfdee04bcbde9d4f7f6734512d568ca41a952f7003f3a56013a54c3',
  'clipboard-button.ts': 'e0baef521256557f5c06b51594aa5b2e3fb55b70d69797cf9fea8e2d15155a49',
  'cursor.ts': '5026b39e999c05531a8d81f07a8ceec0db6ceca8d6c3aabba5570305b5baa0d0',
  'gsap.ts': 'e94daead95c53d5b951c35038102d923953ee42477e5e6ad31bc267be8cdb4b6',
  'lang-switch.ts': '8e209133bb88ecc1accb94a2a8982a4bd5e63f3ed27a80abf61ebad4a1384325',
  'loader.ts': 'b462de8d27e286e6e13c0ac4bff6f233ade905314f3b38977c5aac6b7c08d199',
  'main.ts': '7b2700e6dd397ffbc224dd02a66fb6c5787de7a1e1829486faecd0b3cf9b54d4',
  'motion-config.ts': '9be7e895bb2bfcc86613f433653f84df31b9dc4418fd0f49c6d2a90808b4659b',
  'navbar.ts': '7517b4380e27952168a01e7b1c5b037cbe5b06f9f88c51ee564b6b837adac6ec',
  'preview.ts': '04081c3be01fa554480c5512edb298a21cd06eac81ca301b4929fc77b90862ba',
  'registry.ts': '9567b1242decc17c92f3a9a6e3f4c334f7bc54575626e5a6c3561b398da31743',
  'reveal.ts': 'a1817308ed28362a228f459ef45b220edd66ba41cc70546ca6993d309b572dcf',
  'services.ts': '013cab187b7b5acd4f877f3661a561129f3085c1f2276e437e7ac0d4f78fab72',
  'smooth-scroll.ts': 'b34ada113a2497747bd33600a9c70f8535624a459214384b2c3e7a530a2d68aa',
};

const ADDED = ['border-reveal.ts', 'divider.ts', 'work-scrub.ts'];

function digest(name: string): string {
  let text = readFileSync(`src/scripts/${name}`, 'utf8');
  if (name === 'main.ts') text = text.replace(/import '\.\/(border-reveal|work-scrub|divider)';\n/g, '');
  if (name === 'services.ts') text = text.replaceAll("backgroundColor: '#0b1330'", "backgroundColor: '#000'");
  return createHash('sha256').update(text).digest('hex');
}

describe('movimento congelado', () => {
  it('não há arquivo novo nem removido em src/scripts', () => {
    expect(readdirSync('src/scripts').sort()).toEqual([...Object.keys(FROZEN), ...ADDED].sort());
  });

  it.each(Object.entries(FROZEN))('%s não mudou', (name, hash) => {
    expect(digest(name)).toBe(hash);
  });
});
