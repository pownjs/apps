const { isMacOS } = require('./os')

const isFrameless = isMacOS ? true : false

module.exports = {
    isFrameless
}
