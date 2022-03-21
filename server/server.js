const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');


const {
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_METHOD,
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_INTERNAL_SERVER_ERROR
} = http2.constants;

const options = {
    key: fs.readFileSync('./selfsigned.key'),
    cert: fs.readFileSync('./selfsigned.crt')
}
const server = http2.createSecureServer(options)

server.on('error', (err) => console.error(err))


function respondToStreamError(err, stream) {
    console.log(err);
    if (err.code === 'ENOENT') {
        stream.respond({":status": HTTP_STATUS_NOT_FOUND});
    } else {
        stream.respond({":status": HTTP_STATUS_INTERNAL_SERVER_ERROR});
    }
    stream.end();
}

const staticFileHandler = (stream, headers) => {
    const reqPath = headers[HTTP2_HEADER_PATH];
    const fullPath = path.resolve('./server/public' + reqPath);
    const responseMimeType = mime.lookup(fullPath);

    stream.respondWithFile(fullPath, {
        'content-type': responseMimeType
    }, {
        onError: (err) => respondToStreamError(err, stream)
    });
}

const router = (stream, headers) => {
    // first, extract the path and method pseudo headers
    staticFileHandler(stream, headers)
}

server.on('stream', router)

// start the server on secure port 443
server.listen(443)