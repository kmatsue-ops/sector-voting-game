import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

// Target: specific Daiichi logo and potential Softbank white version if found
const targets = [
    {
        name: "daiichisankyo.svg",
        // Based on user screenshot: File:Daiichi-sankyo logomark.svg
        // I will use the API to get the exact URL for this title to be sure.
        title: "File:Daiichi-sankyo logomark.svg"
    }
];

const outputDir = 'public/logos';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function download() {
    console.log("Starting fix...");

    // 1. Resolve URL for Daiichi
    const title = "File:Daiichi-sankyo logomark.svg";
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;

    try {
        const infoRes = await fetch(infoUrl, { headers: { 'User-Agent': USER_AGENT } });
        const infoData = await infoRes.json();
        const pages = infoData.query.pages;
        const pageId = Object.keys(pages)[0];

        if (pageId !== "-1") {
            const fileUrl = pages[pageId].imageinfo[0].url;
            console.log(`Found URL: ${fileUrl}`);

            // Download
            const response = await fetch(fileUrl, {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Referer': 'https://commons.wikimedia.org/'
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const stream = createWriteStream(path.join(outputDir, "daiichisankyo.svg"));
            await pipeline(response.body, stream);
            console.log("Saved daiichisankyo.svg");
        } else {
            console.error("Daiichi page not found");
        }

    } catch (e) {
        console.error(e);
    }
}

download();
