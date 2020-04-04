const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();

const STATIC_PATH = 'public';
const ABSTRACT_STATIC_PATH = path.resolve(__dirname, STATIC_PATH);
const SEP = '/';
const PORT = 3000;
const PREFIX = `http://localhost:${PORT}${SEP}images${SEP}`

async function getImgUrls(dir) {
    const imgs = await fs.readdir(dir);
    return imgs.map(img => PREFIX + img);
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
    next();
})

app.use(express.static(ABSTRACT_STATIC_PATH));
app.get('/api/img', async (req, res) => {
    const dir = ABSTRACT_STATIC_PATH + SEP + 'images';
    const data = await getImgUrls(dir);
    res.json({ code: 0, data: data })
})

app.listen(PORT, () => console.log(`server listening at 3000`));