const stream = require('stream')
const electron = require('electron')
const JSONStream = require('JSONStream')

window.webPreferences = {
    webSecurity: false
}

window.addEventListener('DOMContentLoaded', () => {
    const url = require('url')
    const http = require('http')
    const https = require('https')

    class API {
        makeRequest(options, callback) {
            console.log(options)
            const { method = 'GET', uri, version = 'HTTP/1.1', headers = {}, body, credentials = false, timeout = 30000, ...rest } = options

            const requestOptions = {
                ...options,

                method,
                headers,

                ...url.parse(uri)
            }

            const transport = {
                'http:': http,
                'https:': https
            }[requestOptions.protocol]

            const controller = new class {
                abort() {
                    throw new Error(`Not implemented`)
                }
            }

            const mapDefaultHandlers = (object) => {
                object.on('error', (error = new Error(`Generic`)) => {
                    if (controller.onerror) {
                        controller.onerror(error)
                    }
                })

                object.on('timeout', (error = new Error(`Timeout`)) => {
                    if (controller.ontimeout) {
                        controller.ontimeout(error)
                    }
                })

                object.on('abort', (error = new Error(`Abort`)) => {
                    if (controller.onabort) {
                        controller.onabort(error)
                    }
                })
            }

            const request = transport.request(requestOptions, (response) => {
                mapDefaultHandlers(response)

                const chunks = []

                response.on('data', (data) => {
                    chunks.push(data)
                })

                response.on('end', () => {
                    const body = Buffer.concat(chunks)

                    if (controller.onload) {
                        controller.onload({
                            responseCode: response.statusCode,
                            responseMessage: response.statusMessage,
                            responseHeaders: response.headers,
                            responseBody: body
                        })
                    }
                })
            })

            mapDefaultHandlers(request)

            request.end(body ? Buffer.from(body) : null)

            callback(null, controller)
        }
    }

    window.secappsExtensionAPI = {
        ['2018-05-01']: new API(),

        latest: new API()
    }
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

    window.addEventListener('beforeunload', (event) => {
        if (event.returnValue) {
            electron.ipcRenderer.send('beforeunload.returnValue', event.returnValue)
        }
    })
})
