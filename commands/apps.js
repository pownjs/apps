exports.yargs = {
    command: 'apps <app>',
    describe: 'App launcher',

    builder: (yargs) => {
        const { apps } = require('../lib/apps')

        Object.entries(apps).forEach(([name, { description, url }]) => {
            yargs.command({
                command: `${name}${name === 'webview' ? ' <url>' : ''}`,
                describe: description || `Launch ${name} app`,

                builder: (yargs) => {
                    yargs = yargs.option('next', {
                        type: 'boolean',
                        description: 'Use the bleeding edge application.',
                        alias: ['n']
                    })
                },

                handler: async(argv) => {
                    const path = require('path')
                    const util = require('util')
                    const electron = require('electron')
                    const { spawn } = require('child_process')

                    const spawnAsync = util.promisify(spawn)

                    const args = []

                    args.push(path.join(__dirname, '..', 'lib', 'main.js'))

                    url = url || argv.url

                    if (argv.next) {
                        url = url.replace(/^https:\/\//i, 'https://next-')
                    }

                    args.push(url)

                    await spawnAsync(electron, args, { stdio: 'inherit' })
                }
            })
        })
    }
}
