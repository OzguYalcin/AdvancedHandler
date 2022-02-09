const blacklistSchema = require('../models/blacklist-schema');

module.exports = {
    aliases: ['black-list', 'bl'],
    ownerOnly: true,
    cooldown: '5s',
    category: 'Configuration',
    description: 'Make user can\'t use commands in every guild.',
    usage: {
        maxArgs: 2,
        minArgs: 1,
        params: [
            "<set | delete | clean>",
            "[user@ | userId]"
        ]
    },
    callback: async ({ client, message, args, instance, prefix, text, guild }) => {
        if (!instance.isDbConnected()) {
            return message.reply(await instance.getMessage(guild, "NO_DATABASE_FOUND"));
        }
        let choice = args[0].toLocaleLowerCase();

        if (!["set", "delete", "clean"].includes(choice)) {
            return message.reply(await instance.createSyntaxError(message, "blacklist", 0, "REQUIRED_PARAM"));
        }

        if ((choice === 'set' || choice === 'delete') && (!args[1] || !message.mentions.users.first())) {
            return message.reply(await instance.getMessage(guild, "TAG_USER"))
        }

        let user = message.mentions.users.first() || client.users.cache.get(args[1])

        if (choice === 'clean') {
            await blacklistSchema.deleteMany({})
            return message.reply(await instance.getMessage(guild, "ALL_BLACKLIST_IS_CLEAN"));
        }

        if (choice === 'set') {
            if (instance.botOwners.includes(user.id)) {
                return message.reply(await instance.getMessage(guild, "YOU_CAN'T_SET_OWNER_TO_BLACKLIST"))
            }
            let result = await blacklistSchema.findOne({ _id: user.id })

            if (result !== null || result) return message.reply(await instance.getMessage(guild, "USER_ALREADY_IN_BLACKLIST"));

            new blacklistSchema({
                _id: user.id
            }).save()

            return message.reply(await instance.getMessage(guild, "USER_SET_TO_BLACKLIST"));
        }

        if (choice === 'delete') {
            let result = await blacklistSchema.findOne({ _id: user.id })

            if (result === null) return message.reply(await instance.getMessage(guild, "USER_ALREADY_DELETED_BLACKLIST"));

            await blacklistSchema.deleteOne({ _id: user.id });

            return message.reply(await instance.getMessage(guild, "USER_DELETED_FROM_BLACKLIST"))
        }
    }
}