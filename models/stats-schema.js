const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const Schema = new mongoose.Schema({
    //guildId
    _id: reqString,
    statu: Boolean,
    bots: {
        channelId: reqString
    },
    members: {
        channelId: reqString
    },
    "all-members": {
        channelId: reqString
    },
    categoryId: reqString
})

module.exports = mongoose.model('advancedhandler-stats', Schema);