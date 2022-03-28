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
        stream.respond({ ":status": HTTP_STATUS_NOT_FOUND });
    } else {
        stream.respond({ ":status": HTTP_STATUS_INTERNAL_SERVER_ERROR });
    }
    stream.end();
}
const assetRoot = './server/public'

const serverPush = (stream, filepath) => {
    const pushHeaders = { [HTTP2_HEADER_PATH]: filepath }

    stream.pushStream(pushHeaders, (err, pushStream) => {
        console.log('pushing');
        pushStream.respondWithFile(path.resolve(assetRoot + filepath), {
            'content-type': "image/jpeg"
        }, {
            onError: (err) => {
                respondToStreamError(err, pushStream)
            }
        })
    })
}
const staticFileHandler = (stream, headers) => {
    const reqPath = headers[HTTP2_HEADER_PATH];
    const fullPath = path.resolve(assetRoot + reqPath);
    const responseMimeType = mime.lookup(fullPath);
    if (fullPath.endsWith(".html")) {
        stream.respondWithFile(fullPath, {
            'content-type': responseMimeType
        }, {
            onError: (err) => respondToStreamError(err, stream)
        });

        serverPush(stream, '/images/1.jpg')
        serverPush(stream, '/images/2.jpg')
        serverPush(stream, '/images/3.jpg')
        serverPush(stream, '/images/4.jpg')
        serverPush(stream, '/images/5.jpg')
        serverPush(stream, '/images/6.jpg')
        serverPush(stream, '/images/7.jpg')
        serverPush(stream, '/images/8.jpg')
        serverPush(stream, '/images/9.jpg')
        serverPush(stream, '/images/10.jpg')
        serverPush(stream, '/images/11.jpg')
        serverPush(stream, '/images/12.jpg')
    } else {

        stream.respondWithFile(fullPath, {
            'content-type': responseMimeType
        }, {
            onError: (err) => respondToStreamError(err, stream)
        });
    }
}

const router = (stream, headers) => {
    // first, extract the path and method pseudo headers
    staticFileHandler(stream, headers)
}

server.on('stream', router)

// start the server on secure port 443
server.listen(443)