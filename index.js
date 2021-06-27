const { mongo } = require('mongoose');
const { join } = require('path');
const CommandHandler = require('./CommandHandler');
const FeaturesHandler = require('./FeaturesHandler');
/**
* @param {any} client
* @param {Object} options
*/
class AdvancedHandler extends CommandHandler{

    constructor(client, options) {
        super(client, {
            commandsDir: options.commandsDir,
            defaultPrefix: options.defaultPrefix,
            mongoURI: options.mongoURI,
            ignoreBots: options.ignoreBots,
            showWarns: options.showWarns,
            botOwners: options.botOwners,
            testServers: options.testServers,
            disableDefaultCommands: options.disableDefaultCommands,
            messagesPath: options.messagesPath,
            dbOptions: options.dbOptions
        })

        new FeaturesHandler(client, {featuresDir: options.featuresDir})
    }
}


module.exports = AdvancedHandler