const url = require('url')
const path = require('path')
const electron = require('electron')
const querystring = require('querystring')
const { launch } = require('@pown/cdb/lib/launch')

const { apps } = require('./apps')
const { getDefaultMenu } = require('./menu')

const windows = []

const allowedUrls = Object.entries(apps).map(([_, def]) => def.url).filter((url) => url)

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

        titleBarStyle: 'hiddenInset',

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

    windows.push(window)

    window.once('close', (event) => {
        event.preventDefault()

        windows.splice(windows.indexOf(window), 1)

        window.destroy()
    })

    if (url) {
        const niceUrl = changeUri(url, { _topBar: true })

        window.loadURL(niceUrl)
    }

    window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()

        if (allowedUrls.some((allowedUrl) => url.indexOf(allowedUrl) === 0 && ['/', '', undefined].includes(url.slice(allowedUrl.length)[0]))) {
            const childWindow = createWindow(url, Object.assign(options, {
                // NOTE: disabled because child windows are always on top
                // parent: window
            }))

            if (!window.children) {
                window.children = []
            }

            window.children.push(childWindow)

            event.newGuest = childWindow

            // NOTE: workaround https://github.com/electron/electron/issues/11128

            setTimeout(() => {
                event.sender.removeAllListeners('current-render-view-deleted')
            }, 0)
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

const createMenu = () => {
    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(getDefaultMenu(electron.app, electron.shell)))

    const tools = {
        [`Debug Chrome (port 9222)`]: async() => {
            await launch({ xssAuditor: true, certificateErrors: false, debuggingPort: 9222 })
        },

        [`Debug Chrome (port 9223)`]: async() => {
            await launch({ xssAuditor: true, certificateErrors: false, debuggingPort: 9223 })
        },

        [`Debug Chrome (port 9224)`]: async() => {
            await launch({ xssAuditor: true, certificateErrors: false, debuggingPort: 9224 })
        },

        [`Debug Chrome (port 9225)`]: async() => {
            await launch({ xssAuditor: true, certificateErrors: false, debuggingPort: 9225 })
        },

        '---': ''
    }

    const updateTools = () => {
        const menu = getDefaultMenu(electron.app, electron.shell)

        if (!menu.find(({ label }) => label === 'Tools')) {
            menu.splice(menu.length - 1, 0, {
                label: 'Tools',
                submenu: []
            })
        }

        const { submenu } = menu.find(({ label }) => label === 'Tools') || {}

        if (submenu) {
            Object.entries(tools).forEach(([label, click]) => {
                if (/^-+/.test(label)) {
                    submenu.push({ type: 'separator' })
                }
                else {
                    submenu.push({ label, click })
                }
            })
        }

        electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu))
    }

    updateTools()

    electron.ipcMain.on('add-tool-for-proxy', (event, { port }) => {
        const label = `Proxy Chrome (port ${port})`

        tools[label] = async() => {
            await launch({ xssAuditor: true, certificateErrors: false, proxy: `localhost:${port}` })
        }

        updateTools()
    })

    electron.ipcMain.on('remove-tool-for-proxy', (event, { port }) => {
        const label = `Proxy Chrome (port ${port})`

        delete tools[label]

        updateTools()
    })
}

electron.app.on('ready', () => {
    createMenu()

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

electron.ipcMain.on('SET_SHEET_OFFSET', (event, setSheetOffset) => {
    const window = electron.BrowserWindow.fromWebContents(event.sender)

    window.setSheetOffset(setSheetOffset)
})

process.on('uncaughtException', (error) => {
    // NOTE: prevent popup
    // NOTE: also prevents exceptions due workaround https://github.com/electron/electron/issues/11128 

    console.error(error)
})
