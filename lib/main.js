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

        width: 1200,
        height: 800,

        alwaysOnTop: false,

        modal: false,

        parent,

        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,

            enableRemoteModule: false,

            preload: path.join(electron.app.getAppPath(), 'preload.js')
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

    window.webContents.on('will-prevent-unload', async(event) => {
        const { response } = await electron.dialog.showMessageBox(window, {
            type: 'question',
            buttons: ['Leave', 'Stay'],
            title: 'Do you want to leave this site?',
            message: 'Changes you made may not be saved.',
            defaultId: 0,
            cancelId: 1
        })

        if (response === 0) {
            window.destroy()
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
})

electron.app.on('activate', () => {
    createMainWindow()
})

electron.app.on('window-all-closed', () => {
    electron.app.quit()
})
