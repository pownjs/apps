const electron = require('electron')
const { Handler } = require('@pown/channel/lib/handler')
const { maybeSerializeArrayBuffer } = require('@pown/channel/lib/helpers')
const { OPEN_MESSAGE_TYPE, CLOSE_MESSAGE_TYPE, ABORT_MESSAGE_TYPE } = require('@pown/channel/lib/consts')

const CdbTrace = require('./cdbtrace')
const HttpTrace = require('./httptrace')

class ObserveTransactionsHandler extends Handler {
    onDisconnect() {
        super.onDisconnect()

        this.close()
    }

    async open(options) {
        const { flavour, port: _port = process.env.PORT } = options || {}

        const port = _port || 8080

        if (['proxy'].includes(flavour)) {
            this.server = new HttpTrace()
        }
        else
        if (['cdb', 'cdb'].includes(flavour)) {
            this.server = new CdbTrace()
        }
        else {
            throw new Error(`Unrecognized flavour ${flavour}`)
        }

        try {
            await this.server.listen({ port })
        }
        catch (e) {
            this.raise(e)

            return
        }

        electron.ipcRenderer.send('add-tool-for-proxy', { port })

        this.server.on('transaction', async(transaction) => {
            transaction = Object.assign({}, transaction)

            transaction.body = await maybeSerializeArrayBuffer(transaction.body)
            transaction.responseBody = await maybeSerializeArrayBuffer(transaction.responseBody)

            this.emitLoad(transaction)
        })

        this.server.on('close', () => {
            electron.ipcRenderer.send('remove-tool-for-proxy', { port })
        })
    }

    async close() {
        await this.server.close()

        this.server = null
    }

    async handleMessage(message) {
        const { type, options } = message

        switch (type) {
            case OPEN_MESSAGE_TYPE:
                await this.open(options || {})

                return

            case CLOSE_MESSAGE_TYPE:
                await this.close()

                return

            case ABORT_MESSAGE_TYPE:
                await this.close()

                return

            default:
                throw new Error(`Unrecognized type ${type}`)
        }
    }
}

module.exports = ObserveTransactionsHandler
