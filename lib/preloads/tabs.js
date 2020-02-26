const electron = require('electron')

electron.ipcRenderer.on('add-tab', (event, data) => {
    window.postMessage({ type: 'add-tab', data })
})

electron.ipcRenderer.on('del-tab', (event, data) => {
    window.postMessage({ type: 'del-tab', data })
})

window.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('message', (event) => {
        const { data } = event

        if (data.type === 'tab-change') {
            electron.ipcRenderer.send('tab-change', data.data)
        }
    })
})
