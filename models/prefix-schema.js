const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const Schema = new mongoose.Schema({
    //Guild ID
    _id: reqString,
    prefix: reqString,
    
})

module.exports = mongoose.model('advancedhandler-prefixes', Schema);