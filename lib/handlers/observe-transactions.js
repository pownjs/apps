const util = require('util')
const zlib = require('zlib')
const MitmProxy = require('@pureproxy/mitmproxy')
const Interceptor = require('@pureproxy/utils/lib/interceptor')
const { HTTPParser, methods } = require('@pureproxy/pureproxy/lib/parser')

const Handler = require('./handler')

const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0
const kOnBody = HTTPParser.kOnBody | 0
const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0

const gunzipAsync = util.promisify(zlib.gunzip.bind(zlib))
const deflateAsync = util.promisify(zlib.deflate.bind(zlib))
const brotliDecompressAsync = util.promisify(zlib.brotliDecompress.bind(zlib))

class HttpTrace extends MitmProxy {
    constructor(...args) {
        super(...args)

        this.sequence = 0
    }

    buildVersion(major, minor) {
        return `HTTP/${major}.${minor}`
    }

    buildHeaders(arrayHeaders) {
        const headers = {}

        for (let valueIndex = 1; valueIndex < arrayHeaders.length; valueIndex += 2) {
            const keyIndex = valueIndex - 1

            const name = arrayHeaders[keyIndex] || ''
            const value = arrayHeaders[valueIndex] || ''

            if (headers.hasOwnProperty(name)) {
                if (!Array.isArray(headers[name])) {
                    headers[name] = [headers[name]]
                }

                headers[name].push(value)
            }
            else {
                headers[name] = value
            }
        }

        return headers
    }

    async serializeRequest(request) {
        const protocol = request.subject.context.method == 5 ? 'https://' : 'http://'

        const method = methods[request.method]
        const uri = `${protocol}${request.subject.hostname}${request.uri}`
        const version = this.buildVersion(request.versionMajor, request.versionMinor)
        const headers = this.buildHeaders(request.headers)

        let body = Buffer.concat(request.bodyChunks)

        const contentEncoding = this.getHttpHeader(request.headers, 'content-encoding')

        if (contentEncoding === 'gzip') {
            body = await gunzipAsync(body)
        }
        else
        if (contentEncoding === 'deflate') {
            body = await deflateAsync(body)
        }
        else
        if (contentEncoding === 'br') {
            body = await brotliDecompressAsync(body)
        }

        return {
            method,
            uri,
            version,
            headers,
            body
        }
    }

    async serializeResponse(response) {
        const responseVersion = this.buildVersion(response.versionMajor, response.versionMinor)
        const responseCode = response.statusCode
        const responseMessage = response.statusMessage
        const responseHeaders = this.buildHeaders(response.headers)

        let responseBody = Buffer.concat(response.bodyChunks)

        const contentEncoding = this.getHttpHeader(response.headers, 'content-encoding')

        if (contentEncoding === 'gzip') {
            responseBody = await gunzipAsync(responseBody)
        }
        else
        if (contentEncoding === 'deflate') {
            responseBody = await deflateAsync(responseBody)
        }
        else
        if (contentEncoding === 'br') {
            responseBody = await brotliDecompressAsync(responseBody)
        }

        return {
            responseVersion,
            responseCode,
            responseMessage,
            responseHeaders,
            responseBody
        }
    }

    async serializeTransaction(_request, _response) {
        const [request, response] = await Promise.all([
            this.serializeRequest(_request),
            this.serializeResponse(_response)
        ])

        const transaction = Object.assign({}, request, response)

        transaction.id = `${this.sequence++}-${Date.now()}-${Math.random().toString(32)}`

        this.emit('transaction', transaction)
    }

    makeRequestParser(context, subject) {
        const requestParser = new HTTPParser(HTTPParser.REQUEST)

        requestParser[kOnHeadersComplete] = function(info) {
            let { versionMajor, versionMinor, headers, method, url: uri, statusCode, statusMessage, upgrade, shouldKeepAlive } = info

            this.request = {
                subject: subject,

                versionMajor,
                versionMinor,
                headers,
                method,
                uri,

                bodyChunks: []
            }
        }

        requestParser[kOnBody] = function(buffer, start, len) {
            buffer = buffer.slice(start, start + len)

            this.request.bodyChunks.push(buffer)
        }

        requestParser[kOnMessageComplete] = function() {
            context.requests.push(this.request)

            delete this.request
        }

        return requestParser
    }

    makeResponseParser(context, subject) {
        const self = this

        const responseParser = new HTTPParser(HTTPParser.RESPONSE)

        responseParser[kOnHeadersComplete] = function(info) {
            let { versionMajor, versionMinor, headers, method, url: uri, statusCode, statusMessage, upgrade, shouldKeepAlive } = info

            this.response = {
                subject: subject,

                versionMajor,
                versionMinor,
                headers,
                statusCode,
                statusMessage,

                bodyChunks: []
            }
        }

        responseParser[kOnBody] = function(buffer, start, len) {
            buffer = buffer.slice(start, start + len)

            this.response.bodyChunks.push(buffer)
        }

        responseParser[kOnMessageComplete] = function() {
            const request = context.requests.pop()
            const response = this.response

            delete this.response

            self.serializeTransaction(request, response)
        }

        return responseParser
    }

    wrapClientForObservableStreaming(client, subject) {
        const self = this

        return new class extends Interceptor {
            constructor() {
                super(client)

                this.writeFore = this._writeFore
                this.writeBack = this._writeBack

                this.writeFore = this._sniffIt

                const context = {
                    requests: []
                }

                this.requestParser = self.makeRequestParser(context, subject)
                this.responseParser = self.makeResponseParser(context, subject)
            }

            _sniffIt(data) {
                this.writeFore = this._writeFore

                this.writeFore(data)
            }

            _writeFore(data) {
                this.requestParser.execute(data)

                super.writeFore(data)
            }

            _writeBack(data) {
                this.responseParser.execute(data)

                super.writeBack(data)
            }
        }
    }

    shouldIntercept() {
        return true
    }
}

class ObserveTransactionsHandler extends Handler {
    onDisconnect() {
        super.onDisconnect()

        this.close()
    }

    async open(options) {
        const { port = process.env.PORT } = options || {}

        this.server = new HttpTrace()

        try {
            await this.server.listen(port || 8080)
        }
        catch (e) {
            this.raise(e)

            return
        }

        this.server.on('transaction', async(transaction) => {
            transaction.body = await maybeSerializeArrayBuffer(transaction.body)
            transaction.responseBody = await maybeSerializeArrayBuffer(transaction.responseBody)

            this.load(transaction)
        })
    }

    async close() {
        this.server.close()

        this.server = null
    }

    async onMessage(message) {
        const { type, options } = message

        try {
            switch (type) {
                case OPEN_MESSAGE_TYPE:
                    await this.open(options || {})

                    return

                case CLOSE_MESSAGE_TYPE:
                    await this.close()

                    return

                default:
                    throw new Error(`Unrecognized type ${type}`)
            }
        }
        catch (e) {
            this.raise(e)
        }
    }
}

module.exports = ObserveTransactionsHandler
