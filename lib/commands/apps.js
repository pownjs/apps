exports.yargs = {
    command: 'apps <app>',
    describe: 'App launcher',

    builder: (yargs) => {
        const { apps } = require('../apps')

        Object.entries(apps).forEach(([name, { description, url }]) => {
            yargs.command({
                command: `${name}${name === 'webview' ? ' <url>' : ''}`,
                describe: description || `Launch ${name} app`,

                builder: (yargs) => {
                    yargs = yargs.option('interactive', {
                        type: 'boolean',
                        description: 'Open a REPL to the main process.',
                        alias: ['i']
                    })
                },

                handler: async(argv) => {
                    const path = require('path')
                    const util = require('util')
                    const electron = require('electron')
                    const { spawn } = require('child_process')

                    const spawnAsync = util.promisify(spawn)

                    const args = []

                    if (argv.interactive) {
                        args.push('-i')
                    }

                    // TODO: add optional --user-data-dir=$(mktemp -d /tmp/google-chome.XXXXXXX)

                    args.push(path.join(__dirname, '..', 'main.js'))

                    args.push(url || argv.url)

                    await spawnAsync(electron, args, { stdio: 'inherit' })
                }
            })
        })
    }
}
