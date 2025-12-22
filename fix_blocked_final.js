import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

// Fix blocked logos
const companies = [
    { name: "ihi.svg", explicitTitle: "File:IHI Corporation Logo.svg" },
    { name: "skyperfectjsat.svg", explicitTitle: "File:SKY Perfect JSAT Group logo.svg" }
];

const outputDir = 'public/logos';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fixBlocked() {
    console.log('Starting Fix...');

    for (const company of companies) {
        try {
            const title = company.explicitTitle;

            // 2. Get the file URL
            const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
            const infoRes = await fetch(infoUrl, { headers: { 'User-Agent': USER_AGENT } });
            const infoData = await infoRes.json();

            const pages = infoData.query.pages;
            const pageId = Object.keys(pages)[0];
            if (pageId === "-1") {
                console.error(`Page not found: ${title}`);
                continue;
            }
            const fileUrl = pages[pageId].imageinfo[0].url;

            console.log(`Downloading ${company.name} from ${fileUrl}`);

            // 3. Download the file
            const response = await fetch(fileUrl, {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Referer': 'https://commons.wikimedia.org/',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const stream = createWriteStream(path.join(outputDir, company.name));
            await pipeline(response.body, stream);
            console.log(`Saved ${company.name}`);

            await new Promise(r => setTimeout(r, 2000));

        } catch (err) {
            console.error(`Error processing ${company.name}: ${err.message}`);
        }
    }
}

fixBlocked();
