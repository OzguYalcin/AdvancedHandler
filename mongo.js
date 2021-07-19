const mongoose = require('mongoose');

module.exports = async (mongoPath, dbOptions) => {
    if(!dbOptions) dbOptions = { keepAlive: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
    if(mongoPath) {
    await mongoose.connect(mongoPath, dbOptions)
    }
    return mongoose;
};