/* global LOAD_MESSAGE_TYPE, ERROR_MESSAGE_TYPE */

class Handler {
    onConnect(port) {
        this.port = port
    }

    onDisconnect() {
        this.port = null
    }

    postMessage(message) {
        if (!this.port) {
            console.error(new Error(`Attempted to send message on closed port`))

            return
        }

        this.port.postMessage(message)
    }

    load(payload) {
        this.postMessage({ type: LOAD_MESSAGE_TYPE, payload })
    }

    raise(payload) {
        this.postMessage({ type: ERROR_MESSAGE_TYPE, payload })
    }
}

module.exports = Handler
