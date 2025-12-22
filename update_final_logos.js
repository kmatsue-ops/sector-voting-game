import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

// targets
const targets = [
    {
        name: "canon.svg",
        url: "https://upload.wikimedia.org/wikipedia/commons/2/22/Canon_logo_2024.svg", // Official red text
        referer: "https://commons.wikimedia.org"
    },
    {
        name: "skyperfectjsat.svg",
        // Trying to find the "Katakana" version SkyPerfecTV!
        // The one in Commons "SKY_Perfect_JSAT_Group_logo.svg" is the corporate one user disliked.
        // Let's try downloading the service logo "SkyPerfecTV_logo.svg" if available or fallback to a known URL for the service logo.
        // Common service logo: "Logo_SkyPerfecTV.svg"
        url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Logo_SkyPerfecTV.svg",
        referer: "https://commons.wikimedia.org"
    }
];

const outputDir = 'public/logos';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function download() {
    console.log("Starting update...");
    for (const t of targets) {
        try {
            console.log(`Downloading ${t.name}...`);
            const response = await fetch(t.url, {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Referer': t.referer
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const stream = createWriteStream(path.join(outputDir, t.name));
            await pipeline(response.body, stream);
            console.log(`Saved ${t.name}`);
        } catch (e) {
            console.error(`Failed ${t.name}: ${e.message}`);
        }
    }
}

download();
