const electron = require('electron')

const bootAPI = () => {
    /* global GenericRuntime */
    /* global MAKE_REQUEST_HANDLER_TYPE, OBSERVE_TRANSACTIONS_HANDLER_TYPE */

    const injectSourceScript = (source) => {
        const script = window.document.createElement('script')

        script.textContent = source

        window.document.documentElement.appendChild(script)
    }

    const injectRemoteScript = (url) => {
        const script = window.document.createElement('script')

        script.src = url

        const promise = new Promise((resolve) => {
            script.onload = resolve
        })

        window.document.documentElement.appendChild(script)

        return promise
    }

    window.addEventListener('DOMContentLoaded', async() => {
        const source = '0a9e12b1-7e7d-4b15-a8d4-b759ad919ee2'

        await injectSourceScript(`window.secappsExtensionWorkerUri = 'https://extension.secapps.com/index.worker.js?_source=${source}'`)

        await Promise.all([
            injectRemoteScript(`https://extension.secapps.com/index.page.js?_source=${source}`),
            injectRemoteScript(`https://extension.secapps.com/index.runtimes.js?_source=${source}`),
            injectRemoteScript(`https://extension.secapps.com/index.helpers.js?_source=${source}`),
            injectRemoteScript(`https://extension.secapps.com/index.consts.js?_source=${source}`)
        ])

        const MakeRequestHandler = require('./handlers/make-request')
        const ObserveTransactionsHandler = require('./handlers/observe-transactions')

        const genericRuntime = new GenericRuntime(window)

        genericRuntime.listen(MAKE_REQUEST_HANDLER_TYPE, MakeRequestHandler)
        genericRuntime.listen(OBSERVE_TRANSACTIONS_HANDLER_TYPE, ObserveTransactionsHandler)
    })
}

const bootDrive = async() => {
    const os = require('os')
    const fs = require('fs')
    const path = require('path')
    const { promisify } = require('util')

    const homedir = os.homedir()

    const chroot = (func) => {
        return (pathname, ...args) => {
            return func(path.join(homedir, path.normalize(pathname)), ...args)
        }
    }

    const statAsync = chroot(promisify(fs.stat))
    const watchAsync = chroot(promisify(fs.watch))
    const mkdirAsync = chroot(promisify(fs.mkdir))
    const rmdirAsync = chroot(promisify(fs.rmdir))
    const renameAsync = chroot(promisify(fs.rename))
    const readdirAsync = chroot(promisify(fs.readdir))
    const createReadStream = chroot(fs.createReadStream)
    const createWriteStream = chroot(fs.createWriteStream)

    const localDriveRuntime = new class {
        id = '3a5a9d5c-7887-46d0-88c8-0620935d1652';

        name = 'Local Drive';

        sep = path.sep;

        join(...args) {
            return path.join(...args)
        }

        extname(...args) {
            return path.extname(...args)
        }

        dirname(...args) {
            return path.dirname(...args)
        }

        basename(...args) {
            return path.basename(...args)
        }

        relative(...args) {
            return path.relative(...args)
        }

        async watch(...args) {
            return await watchAsync(...args)
        }

        async stat(pathname) {
            let stat

            try {
                stat = await statAsync(pathname)
            }
            catch (e) {
                return {
                    type: undefined
                }
            }

            return {
                type: stat.type ? stat.type : (
                    stat.isFile() ? 'file' :
                    stat.isDirectory() ? 'folder' : undefined
                )
            }
        }

        async exists(pathname) {
            const stat = await this.stat(pathname)

            return ['file', 'folder'].includes(stat.type)
        }

        async makeFolder(...args) {
            return await mkdirAsync(...args)
        }

        async readFolder(pathname) {
            const items = await readdirAsync(pathname)

            return Promise.all(items.map((item) => {
                return new Promise(async(resolve) => {
                    const itemPathname = path.join(pathname, item)

                    return resolve({
                        name: item,
                        pathname: itemPathname,
                        stat: await this.stat(itemPathname)
                    })
                })
            }))
        }

        async rename(pathname, newPathname) {
            return await renameAsync(pathname, newPathname)
        }

        async remove(pathname) {
            return await rmdirAsync(pathname, { recursive: true })
        }

        async createReadStream(pathname, sink) {
            // TODO: notify sink

            return createReadStream(pathname)
        }

        async createWriteStream(pathname, sink) {
            // TODO: notify sink

            return createWriteStream(pathname)
        }
    }

    window.drive = {
        getAvailable() {
            return [localDriveRuntime]
        }
    }
}

const bootIO = async() => {
    const stream = require('stream')
    const JSONStream = require('JSONStream')

    window.addEventListener('DOMContentLoaded', () => {
        if (window.io) {
            let jIN

            if (window.io._readableState.objectMode) {
                jIN = window.io.pipe(JSONStream.stringifyObject())
            }
            else {
                jIN = window.io
            }

            let jOUT

            if (window.io._writableState.objectMode) {
                jOUT = JSONStream.parse()
            }
            else {
                jOUT = new stream.PassThrough()
            }

            jOUT.on('data', (data) => {
                window.io.write(data)
            })

            electron.ipcRenderer.on('process.stdin', (event, data) => {
                if (data) {
                    jOUT.write(Buffer.from(data))
                }
                else {
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
    })
}

const bootMisc = async() => {
    window.addEventListener('appReady', () => {
        const topBar = document.querySelector('.top-bar')

        if (topBar) {
            electron.ipcRenderer.send('SET_SHEET_OFFSET', topBar.clientHeight)
        }
    })

    window.addEventListener('load', () => {
        window.addEventListener('beforeunload', (event) => {
            if (event.returnValue) {
                electron.ipcRenderer.send('beforeunload.returnValue', event.returnValue)
            }
        })
    })
}

bootAPI()
bootDrive()
bootIO()
bootMisc()
