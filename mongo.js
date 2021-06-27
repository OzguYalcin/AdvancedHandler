const mongoose = require('mongoose');

const mongo = async (mongoPath, dbOptions) => {
    if(!dbOptions) dbOptions = { keepAlive: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
    await mongoose.connect(mongoPath, dbOptions)
    return mongoose;
}

module.exports = mongo;