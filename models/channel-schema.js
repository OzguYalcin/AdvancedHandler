const mongoose = require('mongoose');
const reqString = {
    type: String,
    required: true,
};
const Schema = new mongoose.Schema({
    //guildID
    guildID: reqString,
    command: reqString,
    //channels id
    channels: [String]
})

module.exports = mongoose.model('advancedhandler-channel', Schema);