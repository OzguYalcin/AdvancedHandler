const mongoose = require('mongoose');

module.exports = async (mongoPath, dbOptions, instance) => {
    if(!dbOptions) dbOptions = { keepAlive: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
    if(mongoPath) {
    await mongoose.connect(mongoPath, dbOptions)
    }
    var results = {
        0: "Disconnected",
        1: "Connected",
        2: "Connecting",
        3: "Disconnecting",
    };
    var connection = mongoose.connection;
    var state = results[connection.readyState] !== undefined ? results[connection.readyState] : "Unkown"
    instance.emit('databaseConnected', connection, state)
    return mongoose;
};