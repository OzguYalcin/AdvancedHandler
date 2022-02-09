const mongoose = require('mongoose');
const reqString = {
    type: String,
    required: true,
};
const Schema = new mongoose.Schema({
    //guildId
    guildId: reqString,
    command: reqString,
    //channels id
    channels: [String]
})

module.exports = mongoose.model('advancedhandler-channel', Schema);