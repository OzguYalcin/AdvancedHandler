const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    command: {
        type: String,
        required: true
    }
})

module.exports = new mongoose.model('advancedhandler-disable-commands', Schema);