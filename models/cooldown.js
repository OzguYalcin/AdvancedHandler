const mongoose = require('mongoose');
const reqString = {
    type: String,
    required: true,
};
const Schema = new mongoose.Schema({
    // guildID-userID
    _id: reqString,
    name: reqString,
    cooldown: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('advancedhandler-cooldowns', Schema);