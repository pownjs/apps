const electron = require('electron')

const Handler = require('../handler')
const HttpTrace = require('./httptrace')

class ObserveTransactionsHandler extends Handler {
    onDisconnect() {
        super.onDisconnect()

        this.close()
    }

    async open(options) {
        const { port: _port = process.env.PORT } = options || {}

        const port = _port || 8080

        this.server = new HttpTrace()

        try {
            await this.server.listen(port)
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

        electron.ipcRenderer.send('add-tool-for-proxy', { port })

        this.server.on('close', () => {
            electron.ipcRenderer.send('remove-tool-for-proxy', { port })
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
