const path = require('path')
const electron = require('electron')

const { apps } = require('./apps')

process.stdin.pause()

const appUri = process.argv.slice(-1)[0]

let mainWindow

const createWindow = (url, parent) => {
    const window = new electron.BrowserWindow({
        frame: true,

        title: '',

        width: 800,
        height: 600,

        alwaysOnTop: false,

        modal: false,

        // parent: parent,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    window.loadURL(url)

    window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()

        if (Object.entries(apps).some(([_, def]) => url.toLowerCase().indexOf(def.url.toLowerCase()) === 0)) {
            event.newGuest = createWindow(url, window)
        }
        else {
            electron.shell.openExternal(url)
        }
    })

    return window
}

const createMainWindow = () => {
    if (!mainWindow) {
        mainWindow = createWindow(appUri)

        mainWindow.on('closed', () => {
            mainWindow = null
        })
    }
}

electron.app.on('ready', () => {
    createMainWindow()

    process.stdin
        .on('data', (data) => {
            if (mainWindow) {
                mainWindow.send('process.stdin', data)
            }
        })
        .on('end', () => {
            if (mainWindow) {
                mainWindow.send('process.stdin', null)
            }
        })

    electron.ipcMain.on('io.ready', () => {
        process.stdin.resume()
    })

    electron.ipcMain.on('io.out', (event, data) => {
        if (data) {
            process.stdout.write(data)
        }
        else {
            process.stdout.end()
        }
    })

    electron.ipcMain.on('beforeunload.returnValue', (event, returnValue) => {
        const window = electron.BrowserWindow.fromWebContents(event.sender)

        const confirmed = (electron.dialog.showMessageBox(window, { type: 'question', message: returnValue, buttons: ['Cancel', 'OK'] }) === 1)

        if (confirmed) {
            window.destroy()
        }
    })
})

electron.app.on('activate', () => {
    createMainWindow()
})

electron.app.on('window-all-closed', () => {
    electron.app.quit()
})
