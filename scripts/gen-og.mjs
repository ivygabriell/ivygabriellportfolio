import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<defs><radialGradient id="g" cx="50%" cy="115%" r="80%"><stop offset="0" stop-color="#1f4fff"/><stop offset="1" stop-color="#0b1330"/></radialGradient></defs>
<rect width="1200" height="630" fill="#0b1330"/><rect width="1200" height="630" fill="url(#g)"/>
<text x="80" y="370" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="500" fill="#f7f8fc" letter-spacing="-2">Ivy Gabriel</text>
<text x="84" y="440" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#f7f8fc" fill-opacity=".75">Desenvolvedor Full Stack</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-cover.png');
console.log('og-cover.png generated');
