const mongoose = require('mongoose');
const reqString = {
    type: String,
    required: true,
};
const Schema = new mongoose.Schema(
    {
        //guild id
        _id:reqString,
        lang: reqString
    })
module.exports = new mongoose.model("advancedhandler-lang", Schema);