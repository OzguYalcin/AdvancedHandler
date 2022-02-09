module.exports = {
    aliases: 'lang',
    cooldown: '10s',
    usage: {
        minArgs: 1,
        maxArgs: 1,
        params: [
            "<language>"
        ]
    },
    guildOnly: true,
    requiredPermissions: ["ADMINISTRATOR"],
    category: "Configuration",
    description: "Displays or sets the language for this Discord server",
    callback: async ({ client, message, args, prefix, instance }) => {
        if (!instance.isDbConnected()) {
            return message.reply(await instance.getMessage(message.guild, "NO_DATABASE_FOUND"));
        }
        let lang = args[0]
        const langs = ["tr", "en"];

        if (!langs.includes(lang.toLocaleLowerCase())) {
            return message.reply(await instance.getMessage(message.guild, "LANGUAGE_NOT_SUPPORTED", { LANG: args[0] }))
        }

        let l = await instance.getLanguage(message.guild)

        if (lang.toLocaleLowerCase() === l) {
            return message.reply(await instance.getMessage(message.guild, "CURRENT_LANGUAGE_ALREADY_THIS", { LANG: l }))
        }

        await instance.setLanguage(message.guild, lang);

        return message.reply(await instance.getMessage(message.guild, "NEW_LANGUAGE", { LANG: lang }))
    }
}