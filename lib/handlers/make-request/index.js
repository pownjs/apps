const { request } = require('@pown/request')
const { Handler } = require('@pown/channel/lib/handler')
const { maybeSerializeArrayBuffer, maybeDeserializeArrayBuffer } = require('@pown/channel/lib/helpers')
const { OPEN_MESSAGE_TYPE, CLOSE_MESSAGE_TYPE, ABORT_MESSAGE_TYPE } = require('@pown/channel/lib/consts')

class MakeRequestHandler extends Handler {
    onDisconnect() {
        super.onDisconnect()
    }

    async open(input) {
        const { timeout, method, uri, version, headers, body } = input || {}

        const req = {
            timeout,

            method,
            uri,
            version,
            headers,

            body: body ? Buffer.from(await maybeDeserializeArrayBuffer(body)) : undefined
        }

        let output

        try {
            output = await request(req)
        }
        catch (e) {
            this.raise(e)

            return
        }

        const { responseVersion, responseCode, responseMessage, responseHeaders, responseBody } = output || {}

        const res = {
            responseVersion,
            responseCode,
            responseMessage,
            responseHeaders,

            responseBody: responseBody ? await maybeSerializeArrayBuffer(responseBody) : undefined
        }

        this.emitLoad(res)
    }

    async abort() {
        // NOTE: not supported
    }

    async handleMessage(message) {
        const { type, options } = message

        switch (type) {
            case OPEN_MESSAGE_TYPE:
                await this.open(options || {})

                return

            case CLOSE_MESSAGE_TYPE:
                await this.abort()

                return

            case ABORT_MESSAGE_TYPE:
                await this.abort()

                return

            default:
                throw new Error(`Unrecognized type ${type}`)
        }
    }
}

module.exports = MakeRequestHandler
