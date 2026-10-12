import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<defs><radialGradient id="g" cx="50%" cy="115%" r="80%"><stop offset="0" stop-color="#4338ca" stop-opacity=".9"/><stop offset="1" stop-color="#000"/></radialGradient></defs>
<rect width="1200" height="630" fill="#000"/><rect width="1200" height="630" fill="url(#g)"/>
<text x="80" y="370" font-family="Helvetica, Arial, sans-serif" font-size="120" font-weight="500" fill="#fff" letter-spacing="-2">Ivy Gabriel</text>
<text x="84" y="440" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#fff" fill-opacity=".7">Portfolio</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-cover.png');
console.log('og-cover.png generated');
