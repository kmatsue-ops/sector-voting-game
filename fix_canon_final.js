import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

const url = "https://upload.wikimedia.org/wikipedia/commons/8/82/Canon_wordmark.svg";
const output = "public/logos/canon.svg";

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function download() {
    console.log(`Downloading ${url}...`);
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Referer': 'https://commons.wikimedia.org/wiki/File:Canon_wordmark.svg',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // Check if we got an SVG
        const type = response.headers.get('content-type');
        if (!type.includes('svg') && !type.includes('xml')) {
            console.warn(`Warning: Content-Type is ${type}`);
        }

        const stream = createWriteStream(output);
        await pipeline(response.body, stream);
        console.log("Download complete.");
    } catch (err) {
        console.error("Failed:", err.message);
    }
}

download();
