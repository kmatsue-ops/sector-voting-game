import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

const url = "https://upload.wikimedia.org/wikipedia/commons/9/91/SKY_Perfect_JSAT_Group_logo.svg";
const output = "public/logos/skyperfectjsat.svg";

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function download() {
    console.log(`Downloading ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Referer': 'https://commons.wikimedia.org/wiki/File:SKY_Perfect_JSAT_Group_logo.svg',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const stream = createWriteStream(output);
        await pipeline(response.body, stream);
        console.log("Download complete.");
    } catch (err) {
        console.error("Failed:", err.message);
    }
}

download();
