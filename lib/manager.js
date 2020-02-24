const path = require('path')
const electron = require('electron')
const EventEmitter = require('events')

const { apps } = require('./apps')

class Manager extends EventEmitter {
    allowedUrls = Object.entries(apps).map(([_, def]) => def.url).filter((url) => url);

    windows = [];
    views = [];

    getWindowFromView(view) {
        for (let _window of this.windows) {
            try {
                if (view === _window.getBrowserView()) {
                    return _window
                }
            }
            catch (e) {}

            try {
                for (let _view of _window.getBrowserViews()) {
                    if (view === _view) {
                        return _window
                    }
                }
            }
            catch (e) {}
        }
    }

    changeUri(uri) {
        return uri
    }

    constructWebPreferences(webPreferences, forcedWebPreferences) {
        return Object.assign(webPreferences || {}, {
            allowRunningInsecureContent: false,

            enableRemoteModule: true,

            nativeWindowOpen: false,

            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,

            safeDialogs: true,

            webSecurity: true,

            webviewTag: false,

            preload: path.join(electron.app.getAppPath(), 'preload.js'),

            ...forcedWebPreferences
        })
    }

    createContent(parentWindow, url, options) {
        // NOTE: do not set parent to parentWindow because child windows are always on top

        return this.createWindow(url, options)
    }

    createView(url, options = { webPreferences: {} }, forcedWebPreferences) {
        const view = new electron.BrowserView(Object.assign(options, {
            webPreferences: this.constructWebPreferences(options.webPreferences, forcedWebPreferences)
        }))

        this.views.push(view)

        this.emit('view-created', view)

        view.webContents.on('close', () => {
            this.views.splice(this.views.indexOf(view), 1)

            this.emit('view-destroyed', view)
        })

        if (url) {
            const niceUrl = this.changeUri(url)

            view.webContents.loadURL(niceUrl)
        }

        view.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
            event.preventDefault()

            if (this.allowedUrls.some((allowedUrl) => url.indexOf(allowedUrl) === 0 && ['/', '', undefined].includes(url.slice(allowedUrl.length)[0]))) {
                const childContent = this.createContent(this.getWindowFromView(view), url, options)

                event.newGuest = childContent

                // NOTE: workaround https://github.com/electron/electron/issues/11128

                setImmediate(() => {
                    event.sender.removeAllListeners('current-render-view-deleted')
                })
            }
            else {
                electron.shell.openExternal(url)
            }
        })

        view.webContents.on('will-prevent-unload', async(event) => {
            const { response } = await electron.dialog.showMessageBox(view, {
                type: 'question',
                buttons: ['Leave', 'Stay'],
                title: 'Do you want to leave this site?',
                message: 'Changes you made may not be saved.',
                defaultId: 0,
                cancelId: 1
            })

            if (response === 0) {
                view.destroy()
            }
        })

        return view
    }

    createWindow(url, options = { webPreferences: {} }, forcedWebPreferences) {
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

            webPreferences: this.constructWebPreferences(options.webPreferences, forcedWebPreferences)
        }))

        this.windows.push(window)

        this.emit('window-created', window)

        window.webContents.on('close', () => {
            this.windows.splice(this.windows.indexOf(window), 1)

            this.emit('window-destroyed', window)
        })

        if (url) {
            const niceUrl = this.changeUri(url)

            window.webContents.loadURL(niceUrl)
        }

        window.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
            event.preventDefault()

            if (this.allowedUrls.some((allowedUrl) => url.indexOf(allowedUrl) === 0 && ['/', '', undefined].includes(url.slice(allowedUrl.length)[0]))) {
                const childContent = this.createContent(window, url, options)

                event.newGuest = childContent

                // NOTE: workaround https://github.com/electron/electron/issues/11128

                setImmediate(() => {
                    event.sender.removeAllListeners('current-render-view-deleted')
                })
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
}

module.exports = {
    Manager
}
