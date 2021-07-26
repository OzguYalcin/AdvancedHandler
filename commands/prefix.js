const prefixSchema = require('../models/prefix-schema');
module.exports = {
    name: 'prefix',
    description: 'Displays or sets the prefix for the current guild',
    category: 'Configuration',
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '[New Prefix]',
    cooldown: '2s',
    guildOnly: true,
    requiredPermissions: ['ADMINISTRATOR'],
    callback: async ({ client, message, args, prefix, instance }) => {
        if(!message.guild) {
            return message.reply(await instance.getMessage(message.guild, "CANNOT_SET_PREFIX_IN_DMS"))
        }
        if (instance.isDBConnected() === false) {
            message.reply(await instance.getMessage(message.guild,"NO_DATABASE_FOUND"));
            return;
        };

        let pre = args[0];

        if(prefix === pre) {
            return message.reply(await instance.getMessage(message.guild, "CURRENT_PREFIX_ALREADY_THIS", {PREFIX: pre}))
        }

        await instance.setPrefix(message.guild, pre);

        return message.channel.send(await instance.getMessage(message.guild, "SET_PREFIX", {PREFIX: pre}));
    }
}