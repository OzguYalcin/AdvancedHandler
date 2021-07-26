const mongoose = require('mongoose');

const Schema = new mongoose.Schema(
    {
        //guild id
        _id: {
            type: String,
            required: true
        },
        lang: {
            type: String,
            required: true
        }
    })
module.exports = new mongoose.model("advancedhandler-lang", Schema);