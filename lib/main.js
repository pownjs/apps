const url = require('url')
const path = require('path')
const electron = require('electron')
const querystring = require('querystring')
const childProcess = require('child_process')

const { apps } = require('./apps')
const { getDefaultMenu } = require('./menu')

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

    if (url) {
        const niceUrl = changeUri(url, { _topBar: true })

        window.loadURL(niceUrl)
    }

    window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()

        if (allowedUrls.some((allowedUrl) => url.indexOf(allowedUrl) === 0 && ['/', '', undefined].includes(url.slice(allowedUrl.length)[0]))) {
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

const createMenu = () => {
    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(getDefaultMenu(electron.app, electron.shell)))

    electron.ipcMain.on('add-tool-for-proxy', (event, { port }) => {
        const menu = getDefaultMenu(electron.app, electron.shell)

        if (!menu.find(({ label }) => label === 'Tools')) {
            menu.splice(menu.length - 1, 0, {
                label: 'Tools',
                submenu: []
            })
        }

        const { submenu } = menu.find(({ label }) => label === 'Tools') || {}

        if (submenu) {
            const newLabel = `Start Chrome with proxy on port ${port}`

            if (!submenu.find(({ label }) => label === newLabel)) {
                submenu.push({
                    label: newLabel,
                    click: () => {
                        switch (process.platform) {
                            case 'darwin':
                                const commonArgs = ['--no-first-run', '--disable-xss-auditor', '--ignore-certificate-errors', `--proxy-server=localhost:${port}`]

                                const args = ['-c', `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --user-data-dir=$(mktemp -d /tmp/google-chome.XXXXXXX) ${commonArgs.join(' ')}`]

                                childProcess.spawn('/bin/bash', args, { detached: true, stdio: 'ignore', env: {} }).unref()

                                break

                            case 'linux':
                                console.warn('linux is currently not supported')

                                break

                            case 'win32':
                                console.warn('win32 is currently not supported')

                                break
                        }
                    }
                })
            }
        }

        electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu))
    })

    electron.ipcMain.on('remove-tool-for-proxy', (event, { port }) => {
        const menu = getDefaultMenu(electron.app, electron.shell)

        const { submenu } = menu.find(({ label }) => label === 'Tools') || {}

        if (submenu) {
            const newLabel = `Start Chrome with proxy on port ${port}`

            submenu.splice(submenu.indexOf(({ label }) => label === newLabel), 1)
        }

        electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(menu))
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
