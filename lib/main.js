const url = require('url')
const path = require('path')
const electron = require('electron')
const querystring = require('querystring')

const { apps } = require('./apps')

process.stdin.pause()

const appUri = process.argv.slice(-1)[0]

const changeUri = (uri, query) => {
    uri = url.parse(uri)

    uri.query = querystring.stringify(Object.assign(querystring.parse(uri.query), query || {}))
    uri.search = `?${uri.query}`

    return url.format(uri)
}

const createWindow = (url, options = { webPreferences: {} }) => {
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
            allowRunningInsecureContent: false,

            enableRemoteModule: true,

            nativeWindowOpen: false,

            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,

            safeDialogs: true,

            webSecurity: true,

            webviewTag: false,

            preload: path.join(electron.app.getAppPath(), 'preload.js')
        })
    }))

    if (url) {
        const niceUrl = changeUri(url, { _topBar: true })

        window.loadURL(niceUrl)
    }

    window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()

        if (Object.entries(apps).some(([_, def]) => url.toLowerCase().indexOf(def.url.toLowerCase()) === 0)) {
            event.newGuest = createWindow(url, Object.assign(options, {
                // NOTE: disabled because child windows are always on top
                // parent: window
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
