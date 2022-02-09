const mongoose = require('mongoose');
const reqString = {
    type: String,
    required: true
}
const Schema = new mongoose.Schema({
    guildId: reqString,
    command: reqString,
    requiredRoles : {
        type: [String],
        required: true
    }
})

module.exports = mongoose.model('advancedhandler-required-roles', Schema)