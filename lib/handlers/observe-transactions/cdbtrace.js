const EventEmitter = require('events')
const { NetworkTransactionTool } = require('@pown/cdb/lib/network')

class CdbTrace extends EventEmitter {
    async listen({ port, host, secure }) {
        const self = this

        this.tool = new class extends NetworkTransactionTool {
            async interceptRequest(request) {
                const pipeline = {
                    request: Promise.resolve(request)
                }

                self.emit('intercept-request', pipeline)

                request = await pipeline.request

                return request
            }

            async interceptResponse(response) {
                const pipeline = {
                    response: Promise.resolve(response)
                }

                self.emit('intercept-response', pipeline)

                response = await pipeline.request

                return response
            }

            onTransaction({ request, response }) {
                const { method, url: uri, version = 'HTTP/1.1', headers, body, postData } = request

                const { responseVersion = 'HTTP/1.1', status: responseCode = 0, statusText: responseMessage = '', headers: responseHeaders, body: responseBody } = response

                const transaction = {
                    method,
                    uri,
                    version,
                    headers,

                    body: body ? Buffer.from(body) : postData ? Buffer.from(postData) : Buffer.alloc(0),

                    responseVersion,
                    responseCode,
                    responseMessage,
                    responseHeaders,

                    responseBody: responseBody ? Buffer.from(responseBody) : Buffer.alloc(0)
                }

                self.emit('transaction', transaction)
            }
        }

        await this.tool.connect({ host, port, secure })
    }

    async close() {
        await this.tool.disconnect()
    }
}

module.exports = CdbTrace
