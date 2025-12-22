import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

// exact titles or direct URLs
const targets = [
    {
        name: "skyperfectjsat.svg",
        url: "https://upload.wikimedia.org/wikipedia/commons/9/91/SKY_Perfect_JSAT_Group_logo.svg",
        referer: "https://commons.wikimedia.org/wiki/File:SKY_Perfect_JSAT_Group_logo.svg"
    },
    {
        name: "disco.svg",
        // Trying a likely URL pattern or known good vector source if found. 
        // If this URL fails, I will fallback to the specific one found in search results:
        url: "https://seeklogo.com/images/D/disco-corporation-logo-A068019E34-seeklogo.com.png", // Fallback to high qual PNG if SVG not direct
        // Ideally we want an SVG. Let's try to query the Wiki API for "Disco" again narrowly.
        isWiki: false
    }
];

const outputDir = 'public/logos';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function download() {
    console.log("Starting final download...");
    for (const t of targets) {
        try {
            console.log(`Downloading ${t.name}...`);
            const headers = {
                'User-Agent': USER_AGENT,
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            };
            if (t.referer) headers['Referer'] = t.referer;

            const response = await fetch(t.url, { headers });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // Check content type
            const type = response.headers.get('content-type');
            if (t.name.endsWith('.svg') && !type.includes('svg') && !type.includes('xml')) {
                console.warn(`Warning: ${t.name} might not be SVG. Content-Type: ${type}`);
            }

            const stream = createWriteStream(path.join(outputDir, t.name));
            await pipeline(response.body, stream);
            console.log(`Saved ${t.name}`);
        } catch (e) {
            console.error(`Failed ${t.name}: ${e.message}`);
        }
    }
}

download();
