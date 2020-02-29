const EventEmitter = require('events')

const events = new class extends EventEmitter {}

module.exports = {
    events
}
