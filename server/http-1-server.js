const http = require('http')
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');



const port = 8080
const assetRoot = './server/public'
const requestListener = (req, res) => {
    const filepath = assetRoot + req.url
    const fullPath = path.resolve(filepath);
    const responseMimeType = mime.lookup(fullPath);

    fs.readFile(filepath, function (error, content) {
        res.writeHead(200, { 'Content-Type': responseMimeType });
        res.end(content, 'utf-8');
    });
}
const server = http.createServer(requestListener);
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});