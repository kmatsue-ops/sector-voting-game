import fs from 'fs';

const discoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
  <text x="100" y="45" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="50" text-anchor="middle" fill="#0044CC">DISCO</text>
</svg>`;

const skyPerfectSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60">
  <text x="150" y="40" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" text-anchor="middle" fill="#005090">SKY Perfect JSAT</text>
</svg>`;

fs.writeFileSync('public/logos/disco.svg', discoSvg);
fs.writeFileSync('public/logos/skyperfectjsat.svg', skyPerfectSvg);
console.log("Created text SVGs.");
