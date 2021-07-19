const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const Schema = new mongoose.Schema({
    //Guild ID
    _id: reqString,
    prefix: {
        type: String,
        required: true
    },
    
})

module.exports = mongoose.model('advancedhandler-prefixes', Schema);