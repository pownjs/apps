const url = require('url')
const path = require('path')
const electron = require('electron')
const querystring = require('querystring')
const { launch } = require('@pown/cdb/lib/launch')

const { apps } = require('./apps')
const { Manager } = require('./manager')
const { getDefaultMenu } = require('./menu')

// pause stdin so that we can start reading from it as soon as the application is ready

process.stdin.pause()

// the browser manager is responsible for creating and managing windows and view

const browserManager = new class extends Manager {
    topOffset = 36;

    useWindows = true; // NOTE: use windows for now until we figure out all bugs

    changeUri(uri) {
        if (this.useWindows) {
            uri = url.parse(uri)

            uri.query = querystring.stringify(Object.assign(querystring.parse(uri.query), { _topBar: true }))
            uri.search = `?${uri.query}`

            return url.format(uri)
        }

        return uri
    }

    createContent(parentWindow, url, options) {
        if (this.useWindows) {
            return super.createContent(parentWindow, url, options)
        }

        const view = this.createView(url, options)

        parentWindow = parentWindow || this.windows[0] // TODO: get the currently focused window

        if (!parentWindow._views) {
            parentWindow._views = []
        }

        parentWindow._views.push(view)

        parentWindow.setBrowserView(view)

        const { width, height } = parentWindow.webContents.getOwnerBrowserWindow().getBounds()

        view.setBounds({ x: 0, y: 0 + this.topOffset, width: width, height: height - this.topOffset })
        view.setAutoResize({ width: true, height: true })

        const tabId = Math.random().toString(32).slice(2)

        parentWindow.webContents.send('add-tab', { id: tabId, caption: 'T' })

        view.on('close', () => {
            parentWindow._views.splice(parentWindow._views.indexOf(view), 1)

            parentWindow.webContents.send('del-tab', { id: tabId })
        })

        return view
    }

    hook() {
        electron.ipcMain.on('tab-change', (event, data) => {
            const { sender: webContents } = event

            const parentWindow = electron.BrowserWindow.fromWebContents(webContents)
            const view = parentWindow._views[data.selectedIndex || 0]

            parentWindow.setBrowserView(view)

            const { width, height } = parentWindow.webContents.getOwnerBrowserWindow().getBounds()

            view.setBounds({ x: 0, y: 0 + this.topOffset, width: width, height: height - this.topOffset })
            view.setAutoResize({ width: true, height: true })
        })
    }
}

// the function is responsible for creating the entire menu

const createMenu = () => {
    electron.Menu.setApplicationMenu(electron.Menu.buildFromTemplate(getDefaultMenu(electron.app, electron.shell)))

    const tools = {
        ...Object.assign({}, ...Object.entries(apps).map(([name, { title, url }]) => {
            return {
                [title || (name[0].toUpperCase() + name.slice(1))]: () => {
                    browserManager.createContent(null, url)
                }
            }
        })),

        '---': '',

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

        '----': ''
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

// handle events from when the application is ready to setting up sheets

electron.app.on('ready', () => {
    browserManager.hook()

    createMenu()

    const appUrl = process.argv.slice(-1)[0]

    let content

    if (browserManager.useWindows) {
        content = browserManager.createWindow(appUrl)
    }
    else {
        const mainWindow = browserManager.createWindow('https://extension.secapps.com/index.tabs.html', {}, {
            preload: path.join(electron.app.getAppPath(), 'preloads', 'tabs.js')
        })

        mainWindow.setSheetOffset(36)

        mainWindow.webContents.on('did-finish-load', () => {
            content = browserManager.createContent(mainWindow, appUrl)
        })
    }

    process.stdin
        .on('data', (data) => {
            if (content.webContents) {
                content.webContents.send('process.stdin', data)
            }
        })
        .on('end', () => {
            if (content.webContents) {
                content.webContents.send('process.stdin', null)
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

    if (window) {
        window.setSheetOffset(setSheetOffset)
    }
})

// capture all unhandled exceptions and print them to stdout

process.on('uncaughtException', (error) => {
    // NOTE: prevent popup
    // NOTE: also prevents exceptions due workaround https://github.com/electron/electron/issues/11128 

    console.error(error)
})
