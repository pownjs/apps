const os = require('os')

const type = os.type()

const isMacOS = /darwin/i.test(type)
const isLinux = /linux/i.test(type)
const isWindow = /window/i.test(type)

module.exports = {
    isMacOS,
    isLinux,
    isWindow
}
