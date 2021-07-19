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

        if (instance.isDBConnected() === false) {
            message.reply(instance.getMessage("NO_DATABASE_FOUND"));
            return;
        };

        await prefixSchema.findByIdAndUpdate(message.guild.id, { prefix: args[0] }, { upsert: true });

        let text = instance.getMessage("SET_PREFIX").replace("{PREFIX}", args[0]);

        return message.reply(text);
    }
}