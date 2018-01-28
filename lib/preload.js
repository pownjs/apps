const electron = require('electron')
const JSONStream = require('JSONStream')

window.webPreferences = {
    webSecurity: false
}

window.addEventListener('load', () => {
    if (window.io) {
        const jIN = window.io.pipe(JSONStream.stringifyObject())
        const jOUT = JSONStream.parse()

        jOUT.on('data', (data) => {
            window.io.write(data)
        })

        electron.ipcRenderer.on('process.stdin', (event, data) => {
            if (data) {
                jOUT.write(Buffer.from(data))
            } else {
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
