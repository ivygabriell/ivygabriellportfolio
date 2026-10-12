import { describe, expect, it } from 'vitest';
import { read } from './dist';

const ORDER = ['destaque', 'sobre', 'servicos', 'contato'];

describe('ordem das seções', () => {
  it.each(['pt', 'en'])('%s: destaque → sobre → serviços → contato', (lang) => {
    const html = read(`${lang}/index.html`);
    const positions = ORDER.map((id) => html.indexOf(`id="${id}"`));
    positions.forEach((pos, i) => expect(pos, `id="${ORDER[i]}"`).toBeGreaterThan(-1));
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
