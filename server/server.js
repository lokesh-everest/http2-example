const http2 = require('http2')

const server = http2.createServer()

server.on('error', (err) => console.error(err))

const helloWorldHandler = (stream, headers) => {
    console.log({headers})
    stream.respond({
        ':status': 200
    })
    stream.end('Hello World')
}

const pingHandler = (stream, headers) => {
    console.log({headers})
    stream.respond({
        ':status': 200
    })
    stream.end('pong')
}

const notFoundHandler = (stream, headers) => {
    stream.respond({
        'content-type': 'text/plain; charset=utf-8',
        ':status': 200
    })
    stream.end('path not found')
}

const router = (stream, headers) => {
    // first, extract the path and method pseudo headers
    const path = headers[':path']
    const method = headers[':method']

    let handler
    if (path === "/hello-world" && method === 'GET') {
        handler = helloWorldHandler
    } else if (path === "/ping" && method == 'GET') {
        handler = pingHandler
    } else {
        handler = notFoundHandler
    }

    handler(stream, headers)
}

server.on('stream', router)

// start the server on port 8000
server.listen(8000)