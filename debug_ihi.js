import fs from 'fs';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function findIHI() {
    const query = "IHI Corporation logo";
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + " filetype:svg")}&srnamespace=6&format=json`;

    try {
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': USER_AGENT } });
        const searchData = await searchRes.json();
        console.log("Results for IHI:");
        if (searchData.query && searchData.query.search) {
            searchData.query.search.forEach(s => console.log(s.title));
        }
    } catch (e) { console.error(e); }
}

findIHI();
