import fs from 'fs';

// SkyPerfect: "スカパー！"
// Increasing viewBox and adjusting to ensure no clipping.
// Using text-anchor middle but with ample width.
const skyPerfectSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120">
  <text x="250" y="85" font-family="'Hiragino Maru Gothic Pro', 'Meiryo', 'Arial Rounded MT Bold', sans-serif" font-weight="900" font-size="90" text-anchor="middle" fill="#0099FF">スカパー！</text>
</svg>`;

fs.writeFileSync('public/logos/skyperfectjsat.svg', skyPerfectSvg);
console.log("Fixed SkyPerfect SVG.");
