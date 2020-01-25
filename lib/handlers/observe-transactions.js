const util = require('util')
const zlib = require('zlib')
const MitmProxy = require('@pureproxy/mitmproxy')
const Interceptor = require('@pureproxy/utils/lib/interceptor')
const { HTTPParser, methods } = require('@pureproxy/pureproxy/lib/parser')

const Handler = require('../lib/handler')

const kOnHeadersComplete = HTTPParser.kOnHeadersComplete | 0
const kOnBody = HTTPParser.kOnBody | 0
const kOnMessageComplete = HTTPParser.kOnMessageComplete | 0

const gunzipAsync = util.promisify(zlib.gunzip.bind(zlib))
const deflateAsync = util.promisify(zlib.deflate.bind(zlib))
const brotliDecompressAsync = util.promisify(zlib.brotliDecompress.bind(zlib))

class HttpTrace extends MitmProxy {
    constructor(...args) {
        super(...args)

        this.id = 0
        this.transactions = {}
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

    maybeCommitTransaction(id) {
        const transaction = this.transactions[id]

        if (transaction.body && transaction.responseBody) {
            delete this.transactions[id]

            this.emit('transaction', transaction)
        }
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

        this.transactions[request.id] = Object.assign(this.transactions[request.id] || {}, {
            method,
            uri,
            version,
            headers,
            body
        })

        this.maybeCommitTransaction(request.id)
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

        this.transactions[response.id] = Object.assign(this.transactions[response.id] || {}, {
            responseVersion,
            responseCode,
            responseMessage,
            responseHeaders,
            responseBody
        })

        this.maybeCommitTransaction(response.id)
    }

    makeRequestParser(id, subject) {
        const self = this

        const requestParser = new HTTPParser(HTTPParser.REQUEST)

        requestParser[kOnHeadersComplete] = function(info) {
            let { versionMajor, versionMinor, headers, method, url: uri, statusCode, statusMessage, upgrade, shouldKeepAlive } = info

            this.info = {
                id: id,
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

            this.info.bodyChunks.push(buffer)
        }

        requestParser[kOnMessageComplete] = function() {
            self.serializeRequest(this.info)

            delete this.info
        }

        return requestParser
    }

    makeResponseParser(id, subject) {
        const self = this

        const responseParser = new HTTPParser(HTTPParser.RESPONSE)

        responseParser[kOnHeadersComplete] = function(info) {
            let { versionMajor, versionMinor, headers, method, url: uri, statusCode, statusMessage, upgrade, shouldKeepAlive } = info

            this.info = {
                id: id,
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

            this.info.bodyChunks.push(buffer)
        }

        responseParser[kOnMessageComplete] = function() {
            self.serializeResponse(this.info)

            delete this.info
        }

        return responseParser
    }

    wrapClientForObservableStreaming(client, subject) {
        const id = `${Date.now()}-${this.id++}`

        const requestParser = this.makeRequestParser(id, subject)
        const responseParser = this.makeResponseParser(id, subject)

        return new class extends Interceptor {
            constructor() {
                super(client)

                this.writeFore = this._writeFore
                this.writeBack = this._writeBack

                this.writeFore = this._sniffIt
            }

            _sniffIt(data) {
                this.writeFore = this._writeFore

                this.writeFore(data)
            }

            _writeFore(data) {
                requestParser.execute(data)

                super.writeFore(data)
            }

            _writeBack(data) {
                responseParser.execute(data)

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
