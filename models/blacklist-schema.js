const mongoose = require('mongoose');

const reqString = {
    type: String,
    required: true
}

const Schema = new mongoose.Schema({
    _id: reqString,
});

module.exports = mongoose.model('advancedhandler-blacklist', Schema);