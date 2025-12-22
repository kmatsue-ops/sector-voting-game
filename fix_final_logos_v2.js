import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

const targets = [
    {
        name: "skyperfectjsat.svg",
        url: "https://upload.wikimedia.org/wikipedia/commons/9/91/SKY_Perfect_JSAT_Group_logo.svg",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://commons.wikimedia.org/wiki/File:SKY_Perfect_JSAT_Group_logo.svg'
        }
    },
    {
        name: "disco.png",
        url: "https://seeklogo.com/images/D/disco-corporation-logo-A068019E34-seeklogo.com.png",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }
];

const outputDir = 'public/logos';

async function download() {
    console.log("Starting final download...");
    for (const t of targets) {
        try {
            console.log(`Downloading ${t.name}...`);
            const response = await fetch(t.url, { headers: t.headers });
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
