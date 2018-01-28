exports.yargs = {
    command: 'apps [options] <app>',
    describe: 'App launcher',

    builder: (yargs) => {
        const apps = require('./apps')

        yargs = yargs.option('interactive', {
            alias: 'i',
            type: 'boolean',
            description: 'Open a REPL to the main process.'
        })

        Object.entries(apps).forEach(([name, def]) => {
            yargs = yargs.command(name, def.description || `Launch ${name} app`)
        })

        this.yargs = yargs
    },

    handler: (argv) => {
        const apps = require('./apps')

        if (!apps.hasOwnProperty(argv.app)) {
            this.yargs.showHelp()

            process.exit(1)
        }

        const path = require('path')
        const electron = require('electron')
        const childProcess = require('child_process')

        const args = []

        if (argv.i) {
            args.push('-i')
        }

        args.push(path.join(__dirname, 'main.js'))

        args.push(apps[argv.app].url)

        childProcess.spawn(electron, args, {stdio: 'inherit'})
    }
}
