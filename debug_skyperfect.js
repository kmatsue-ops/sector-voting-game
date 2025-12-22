import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugSkyPerfect() {
    console.log('Searching for SKY Perfect...');
    const query = "SKY Perfect JSAT";
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " filetype:svg")}&srnamespace=6&format=json`;

    try {
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
        const searchData = await searchRes.json();

        if (searchData.query && searchData.query.search) {
            console.log("Results:", searchData.query.search.map(s => s.title));
            if (searchData.query.search.length > 0) {
                const title = searchData.query.search[0].title;
                const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
                const infoRes = await fetch(infoUrl, { headers: { 'User-Agent': USER_AGENT } });
                const infoData = await infoRes.json();
                const pages = infoData.query.pages;
                const pageId = Object.keys(pages)[0];
                const fileUrl = pages[pageId].imageinfo[0].url;
                console.log("Downloading from", fileUrl);

                const response = await fetch(fileUrl, {
                    headers: {
                        'User-Agent': USER_AGENT,
                        'Referer': 'https://commons.wikimedia.org/',
                        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                    }
                });
                const stream = createWriteStream(path.join('public/logos', 'skyperfectjsat.svg'));
                await pipeline(response.body, stream);
                console.log("Saved skyperfectjsat.svg");
            }
        } else {
            console.log("No results");
        }
    } catch (e) {
        console.error(e);
    }
}

debugSkyPerfect();
