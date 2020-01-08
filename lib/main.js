const path = require('path')
const electron = require('electron')

const { apps } = require('./apps')

process.stdin.pause()

const appUri = process.argv.slice(-1)[0]

const createWindow = (url, options = { webPreferences: {} }) => {
    url = `${url}?_topBar=true`

    const window = new electron.BrowserWindow(Object.assign(options, {
        show: true,

        frame: false,

        title: '',

        x: undefined,
        y: undefined,

        width: 1200,
        height: 800,

        minWidth: 300,
        minHeight: 300,

        alwaysOnTop: false,

        modal: false,

        webPreferences: Object.assign(options.webPreferences, {
            nativeWindowOpen: true,

            nodeIntegration: false,
            nodeIntegrationInWorker: false,

            enableRemoteModule: false,

            preload: path.join(electron.app.getAppPath(), 'preload.js')
        })
    }))

    window.loadURL(url)

    window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()

        if (Object.entries(apps).some(([_, def]) => url.toLowerCase().indexOf(def.url.toLowerCase()) === 0)) {
            event.newGuest = createWindow(url, Object.assign(options, {
                // parent: window // NOTE: disabled because child windows are always on top
            }))
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

electron.app.on('ready', () => {
    const mainWindow = createWindow(appUri)

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

electron.app.on('window-all-closed', () => {
    electron.app.quit()
})
