import fs from 'fs';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import path from 'path';

const logos = [
    { name: "softbank.svg", url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/SoftBank_Group_logo.svg" },
    { name: "keyence.svg", url: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Keyence_logo.svg" },
    { name: "fanuc.svg", url: "https://upload.wikimedia.org/wikipedia/commons/4/46/Fanuc_logo.svg" },
    { name: "smc.svg", url: "https://upload.wikimedia.org/wikipedia/commons/d/d3/SMC_Corporation_logo.svg" },
    { name: "omron.svg", url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Omron_logo.svg" },
    { name: "fujitsu.svg", url: "https://upload.wikimedia.org/wikipedia/commons/9/90/Fujitsu-Logo.svg" },
    { name: "nec.svg", url: "https://upload.wikimedia.org/wikipedia/commons/8/85/NEC_logo.svg" },
    { name: "ntt.svg", url: "https://upload.wikimedia.org/wikipedia/commons/6/62/NTT_logo.svg" },
    { name: "hitachi.svg", url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Hitachi_logo.svg" },
    { name: "mitsubishielectric.svg", url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Mitsubishi_Electric_logo.svg" },
    { name: "tokyoelectron.svg", url: "https://upload.wikimedia.org/wikipedia/commons/5/53/Tokyo_Electron_Logo.svg" },
    { name: "advantest.svg", url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Advantest_logo.svg" },
    { name: "shinetsu.svg", url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Shin-Etsu_Chemical_Logo.svg" },
    { name: "disco.svg", url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Disco_Corporation_logo.svg" },
    { name: "lasertec.svg", url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Lasertec_Logo.svg" },
    { name: "chugai.svg", url: "https://upload.wikimedia.org/wikipedia/commons/0/07/Chugai_Pharmaceutical_logo.svg" },
    { name: "daiichisankyo.svg", url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Daiichi_Sankyo_logo.svg" },
    { name: "takeda.svg", url: "https://upload.wikimedia.org/wikipedia/commons/3/36/Takeda_Pharmaceutical_Company_logo.svg" },
    { name: "otsuka.svg", url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Otsuka_Pharmaceutical_logo.svg" },
    { name: "astellas.svg", url: "https://upload.wikimedia.org/wikipedia/commons/8/88/Astellas_Pharma_logo.svg" },
    { name: "ihi.svg", url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/IHI_logo.svg" },
    { name: "sumitomo.svg", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Sumitomo_Electric_Industries_logo.svg" },
    { name: "fujikura.svg", url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Fujikura.svg" },
    { name: "furukawa.svg", url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Furukawa_Electric_en_logo.svg" },
    { name: "jgc.svg", url: "https://upload.wikimedia.org/wikipedia/commons/3/35/JGC_Corporation_logo.svg" },
    { name: "mitsubishiheavy.svg", url: "https://upload.wikimedia.org/wikipedia/commons/2/27/Mitsubishi_Heavy_Industries_logo.svg" },
    { name: "kawasaki.svg", url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Kawasaki_Heavy_Industries_logo.svg" },
    { name: "skyperfectjsat.svg", url: "https://upload.wikimedia.org/wikipedia/commons/2/23/SKY_Perfect_JSAT_Group_logo.svg" },
    { name: "canon.svg", url: "https://upload.wikimedia.org/wikipedia/commons/2/22/Canon_logo_2017.svg" },
    { name: "kddi.svg", url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/KDDI_logo.svg" }
];

const outputDir = 'public/logos';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadLogos() {
    console.log('Starting download...');
    for (const logo of logos) {
        try {
            console.log(`Downloading ${logo.name}...`);
            const response = await fetch(logo.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);

            const stream = createWriteStream(path.join(outputDir, logo.name));
            await pipeline(response.body, stream);
            console.log(`Saved ${logo.name}`);
        } catch (err) {
            console.error(`Failed to download ${logo.name}: ${err.message}`);
        }
    }
    console.log('All downloads complete.');
}

downloadLogos();
