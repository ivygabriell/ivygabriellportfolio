import { existsSync, readFileSync } from 'node:fs';

export const read = (path: string) => readFileSync(`dist/${path}`, 'utf8');
export const exists = (path: string) => existsSync(`dist/${path}`);

// O Astro escapa aspas e apóstrofos no HTML; os testes de texto comparam com o texto decodificado.
export const readDecoded = (path: string) =>
  read(path)
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');
