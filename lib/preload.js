/* global GenericRuntime */
/* global ERROR_MESSAGE_TYPE, RESOLVE_MESSAGE_TYPE, REJECT_MESSAGE_TYPE, MAKE_REQUEST_HANDLER_TYPE, OPEN_MESSAGE_TYPE, ABORT_MESSAGE_TYPE */

const stream = require('stream')
const electron = require('electron')
const JSONStream = require('JSONStream')
const { request } = require('@pown/request')

const injectSourceScript = (source) => {
    const script = window.document.createElement('script')

    script.textContent = source

    window.document.documentElement.appendChild(script)
}

const injectRemoteScript = (url) => {
    const script = window.document.createElement('script')

    script.src = url

    const promise = new Promise((resolve) => {
        script.onload = resolve
    })

    window.document.documentElement.appendChild(script)

    return promise
}

const makeError = (error) => {
    if (error instanceof Object) {
        return error
    }
    else {
        return new Error(error)
    }
}

const makeGenericError = (error) => {
    error = makeError(error)

    error.code = ERROR_MESSAGE_TYPE

    return error
}

class MakeRequestHandler {
    onConnect(port) {
        this.port = port
    }

    onDisconnect() {
        this.port = null
    }

    resolve(kind, resolution) {
        if (!this.port) {
            console.error(makeGenericError(`Attempted to send message on closed port`))

            return
        }

        this.port.postMessage({ type: RESOLVE_MESSAGE_TYPE, kind, resolution })

        this.port.disconnect()
    }

    reject(kind, rejection) {
        if (!this.port) {
            console.error(makeGenericError(`Attempted to send message on closed port`))

            return
        }

        if (rejection instanceof Error) {
            rejection = rejection.message || rejection.toString()
        }

        this.port.postMessage({ type: REJECT_MESSAGE_TYPE, kind, rejection })

        this.port.disconnect()
    }

    async send(input) {
        const { timeout, method, uri, version, headers, body } = input || {}

        const req = {
            timeout,

            method,
            uri,
            version,
            headers,

            body: body ? Buffer.from(maybeDeserializeArrayBuffer(body)) : undefined
        }

        let output

        try {
            output = await request(req)
        }
        catch (e) {
            this.reject(e)

            return
        }

        const { responseVersion, responseCode, responseMessage, responseHeaders, responseBody } = output || {}

        const res = {
            responseVersion,
            responseCode,
            responseMessage,
            responseHeaders,

            responseBody: responseBody ? maybeSerializeArrayBuffer(responseBody) : undefined
        }

        this.resolve('response', res)
    }

    async abort() {
        // NOTE: not supported
    }

    async onMessage(message) {
        const { type, options } = message

        switch (type) {
            case OPEN_MESSAGE_TYPE:
                try {
                    await this.send(options || {})
                }
                catch (e) {
                    this.reject(e.code || ERROR_MESSAGE_TYPE, e)
                }

                return

            case ABORT_MESSAGE_TYPE:
                try {
                    await this.abort()
                }
                catch (e) {
                    this.reject(e.code || ERROR_MESSAGE_TYPE, e)
                }

                return

            default:
                throw makeGenericError(`Unrecognized type ${type}`)
        }
    }
}

window.addEventListener('DOMContentLoaded', async() => {
    const source = '6cad9845-1461-4185-83d6-fed085b16708'

    await injectSourceScript(`window.secappsExtensionWorkerUri = 'https://extension.secapps.com/index.worker.js?_source=${source}'`)

    await Promise.all([
        injectRemoteScript(`https://extension.secapps.com/index.page.js?_source=${source}`),
        injectRemoteScript(`https://extension.secapps.com/index.runtimes.js?_source=${source}`),
        injectRemoteScript(`https://extension.secapps.com/index.helpers.js?_source=${source}`),
        injectRemoteScript(`https://extension.secapps.com/index.consts.js?_source=${source}`)
    ])

    const genericRuntime = new GenericRuntime(window)

    genericRuntime.listen(MAKE_REQUEST_HANDLER_TYPE, MakeRequestHandler)
})

window.addEventListener('load', () => {
    if (window.io) {
        let jIN

        if (window.io._readableState.objectMode) {
            jIN = window.io.pipe(JSONStream.stringifyObject())
        }
        else {
            jIN = window.io
        }

        let jOUT

        if (window.io._writableState.objectMode) {
            jOUT = JSONStream.parse()
        }
        else {
            jOUT = new stream.PassThrough()
        }

        jOUT.on('data', (data) => {
            window.io.write(data)
        })

        electron.ipcRenderer.on('process.stdin', (event, data) => {
            if (data) {
                jOUT.write(Buffer.from(data))
            }
            else {
                jOUT.end()
            }
        })

        electron.ipcRenderer.send('io.ready')

        jIN
            .on('data', (data) => {
                electron.ipcRenderer.send('io.out', data)
            })
            .on('end', () => {
                electron.ipcRenderer.send('io.out', null)
            })
    }
})

window.addEventListener('appReady', () => {
    const topBar = document.querySelector('.top-bar')

    if (topBar) {
        electron.ipcRenderer.send('SET_SHEET_OFFSET', topBar.clientHeight)
    }
})

window.addEventListener('load', () => {
    window.addEventListener('beforeunload', (event) => {
        if (event.returnValue) {
            electron.ipcRenderer.send('beforeunload.returnValue', event.returnValue)
        }
    })
})
