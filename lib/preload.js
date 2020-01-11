/* global GenericRuntime */
/* global MAKE_REQUEST_HANDLER_TYPE, OBSERVE_TRANSACTIONS_HANDLER_TYPE */

const stream = require('stream')
const electron = require('electron')
const JSONStream = require('JSONStream')

const MakeRequestHandler = require('./handlers/make-request')
const ObserveTransactionsHandler = require('./handlers/observe-transactions')

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

window.addEventListener('DOMContentLoaded', async() => {
    const source = '0a9e12b1-7e7d-4b15-a8d4-b759ad919ee2'

    await injectSourceScript(`window.secappsExtensionWorkerUri = 'https://extension.secapps.com/index.worker.js?_source=${source}'`)

    await Promise.all([
        injectRemoteScript(`https://extension.secapps.com/index.page.js?_source=${source}`),
        injectRemoteScript(`https://extension.secapps.com/index.runtimes.js?_source=${source}`),
        injectRemoteScript(`https://extension.secapps.com/index.helpers.js?_source=${source}`),
        injectRemoteScript(`https://extension.secapps.com/index.consts.js?_source=${source}`)
    ])

    const genericRuntime = new GenericRuntime(window)

    genericRuntime.listen(MAKE_REQUEST_HANDLER_TYPE, MakeRequestHandler)
    genericRuntime.listen(OBSERVE_TRANSACTIONS_HANDLER_TYPE, ObserveTransactionsHandler)
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
