import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

const companies = [
    { name: "softbank.svg", query: "SoftBank Group logo" },
    { name: "keyence.svg", query: "Keyence logo" },
    { name: "fanuc.svg", query: "Fanuc logo" },
    { name: "smc.svg", query: "SMC Corporation logo" },
    { name: "omron.svg", query: "Omron logo" },
    { name: "fujitsu.svg", query: "Fujitsu logo" },
    { name: "nec.svg", query: "NEC logo" },
    { name: "ntt.svg", query: "Nippon Telegraph and Telephone logo" },
    { name: "hitachi.svg", query: "Hitachi logo" },
    { name: "mitsubishielectric.svg", query: "Mitsubishi Electric logo" },
    { name: "tokyoelectron.svg", query: "Tokyo Electron logo" },
    { name: "advantest.svg", query: "Advantest logo" },
    { name: "shinetsu.svg", query: "Shin-Etsu Chemical logo" },
    { name: "disco.svg", query: "Disco Corporation logo" },
    { name: "lasertec.svg", query: "Lasertec logo" },
    { name: "chugai.svg", query: "Chugai Pharmaceutical logo" },
    { name: "daiichisankyo.svg", query: "Daiichi Sankyo logo" },
    { name: "takeda.svg", query: "Takeda Pharmaceutical logo" },
    { name: "otsuka.svg", query: "Otsuka Pharmaceutical logo" },
    { name: "astellas.svg", query: "Astellas Pharma logo" },
    { name: "ihi.svg", query: "IHI Corporation logo" },
    { name: "sumitomo.svg", query: "Sumitomo Electric Industries logo" },
    { name: "fujikura.svg", query: "Fujikura logo" },
    { name: "furukawa.svg", query: "Furukawa Electric logo" },
    { name: "jgc.svg", query: "JGC Corporation logo" },
    { name: "mitsubishiheavy.svg", query: "Mitsubishi Heavy Industries logo" },
    { name: "kawasaki.svg", query: "Kawasaki Heavy Industries logo" },
    { name: "skyperfectjsat.svg", query: "SKY Perfect JSAT logo" },
    { name: "canon.svg", query: "Canon logo" },
    { name: "kddi.svg", query: "KDDI logo" }
];

const outputDir = 'public/logos';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Mimic a real browser to bypass hotlinking protection
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function searchAndDownload() {
    console.log('Starting API search and download...');

    for (const company of companies) {
        try {
            // 1. Search for the file
            const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(company.query + " filetype:svg")}&srnamespace=6&format=json`;
            const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
            const searchData = await searchRes.json();

            if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
                console.warn(`No results for ${company.query}`);
                continue;
            }

            const title = searchData.query.search[0].title;

            // 2. Get the file URL
            const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
            const infoRes = await fetch(infoUrl, { headers: { 'User-Agent': USER_AGENT } });
            const infoData = await infoRes.json();

            const pages = infoData.query.pages;
            const pageId = Object.keys(pages)[0];
            const fileUrl = pages[pageId].imageinfo[0].url;

            console.log(`Downloading ${company.name} from ${fileUrl}`);

            // 3. Download the file with Referer
            const response = await fetch(fileUrl, {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Referer': 'https://commons.wikimedia.org/', // Important!
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const stream = createWriteStream(path.join(outputDir, company.name));
            await pipeline(response.body, stream);
            console.log(`Saved ${company.name}`);

            await new Promise(r => setTimeout(r, 1000));

        } catch (err) {
            console.error(`Error processing ${company.name}: ${err.message}`);
        }
    }
}

searchAndDownload();
