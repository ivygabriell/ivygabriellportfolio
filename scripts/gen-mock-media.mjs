import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const dir = 'src/content/projects';

function scene(w, h, [a, b, c], seed) {
  const rand = (n) => {
    seed = (seed * 9301 + 49297 + n * 233) % 233280;
    return seed / 233280;
  };
  const min = Math.min(w, h);
  const blobs = Array.from({ length: 5 }, (_, i) =>
    `<circle cx="${(rand(i) * w).toFixed(0)}" cy="${(rand(i + 9) * h).toFixed(0)}" r="${((0.12 + rand(i + 3) * 0.22) * min).toFixed(0)}" fill="${i % 2 ? b : c}" opacity=".55"/>`,
  ).join('');
  const bw = w * 0.62, bh = h * 0.5, bx = (w - bw) / 2, by = (h - bh) / 2;
  const line = (y, width, opacity, fill = '#000') =>
    `<rect x="${bx + bw * 0.06}" y="${by + bh * y}" width="${bw * width}" height="${bh * 0.05}" rx="${bh * 0.025}" fill="${fill}" opacity="${opacity}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<filter id="s"><feGaussianBlur stdDeviation="${(min * 0.05).toFixed(0)}"/></filter></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<g filter="url(#s)">${blobs}</g>
<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${bw * 0.04}" fill="#fff" opacity=".92"/>
<rect x="${bx + bw * 0.06}" y="${by + bh * 0.1}" width="${bw * 0.4}" height="${bh * 0.09}" rx="${bh * 0.045}" fill="${a}"/>
${line(0.3, 0.7, 0.14)}${line(0.42, 0.55, 0.1)}${line(0.54, 0.62, 0.1)}
<rect x="${bx + bw * 0.06}" y="${by + bh * 0.72}" width="${bw * 0.24}" height="${bh * 0.12}" rx="${bh * 0.06}" fill="#000"/>
</svg>`;
}

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const project = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'));
  const out = `public/media/projects/${project.slug}`;
  mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/cover.svg`, scene(1600, 1000, project.palette, 1));
  project.shots.forEach((_, i) => writeFileSync(`${out}/shot-${i + 1}.svg`, scene(1000, 1250, project.palette, i + 2)));
}
console.log('mock media generated');
