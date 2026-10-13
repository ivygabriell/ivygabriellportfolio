// Gera os 5 logos FICTÍCIOS de public/media/clients/. Não rode de novo depois de trocar por logos reais:
// ele sobrescreve os arquivos com o mesmo nome.
import { mkdirSync, writeFileSync } from 'node:fs';

const INK = '#0b1330';
// [id, nome, símbolo] — a mesma lista de src/content/clients.ts (um teste confere os nomes).
const LOGOS = [
  ['lumora', 'Lumora', 'circle'],
  ['brisa-pay', 'Brisa Pay', 'square'],
  ['vertix', 'Vertix', 'triangle'],
  ['nimbo', 'Nimbo', 'twin'],
  ['kairo', 'Kairo', 'diamond'],
];

// Cada símbolo cabe em 68×60, a partir de (4,10).
const MARKS = {
  circle: `<circle cx="34" cy="40" r="26"/>`,
  square: `<rect x="8" y="14" width="52" height="52" rx="14"/>`,
  triangle: `<polygon points="34,10 62,66 6,66"/>`,
  twin: `<circle cx="22" cy="40" r="18"/><circle cx="46" cy="40" r="18" fill-opacity=".55"/>`,
  diamond: `<polygon points="34,10 62,40 34,70 6,40"/>`,
  ring: `<circle cx="34" cy="40" r="21" fill="none" stroke="${INK}" stroke-width="10"/>`,
  bars: `<rect x="6" y="40" width="12" height="26" rx="3"/><rect x="24" y="22" width="12" height="44" rx="3"/><rect x="42" y="10" width="12" height="56" rx="3"/>`,
  hex: `<polygon points="34,10 58,24 58,56 34,70 10,56 10,24"/>`,
  plus: `<rect x="26" y="10" width="16" height="56" rx="4"/><rect x="6" y="30" width="56" height="16" rx="4"/>`,
  wave: `<path d="M4 46 C14 20 24 20 34 46 S54 72 64 34" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`,
  dots: `<circle cx="18" cy="24" r="10"/><circle cx="50" cy="24" r="10" fill-opacity=".55"/><circle cx="18" cy="56" r="10" fill-opacity=".55"/><circle cx="50" cy="56" r="10"/>`,
  half: `<path d="M6 46 A28 28 0 0 1 62 46 Z"/><rect x="6" y="52" width="56" height="12" rx="4"/>`,
};

mkdirSync('public/media/clients', { recursive: true });
for (const [id, name, mark] of LOGOS) {
  const width = 84 + Math.round(name.length * 17) + 8;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 80" width="${width}" height="80" fill="${INK}"><g>${MARKS[mark]}</g><text x="84" y="53" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="-0.5">${name}</text></svg>\n`;
  writeFileSync(`public/media/clients/${id}.svg`, svg);
}
console.log(`${LOGOS.length} logos fictícios gerados em public/media/clients/`);
