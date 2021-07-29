const DiscordJS = require('discord.js');
module.exports = {
    name: 'help',
    aliases: ['command'],
    category: 'Help',
    description: "Displays this bot's commands",
    maxArgs: 1,
    cooldown: '3s',
    expectedArgs: '[command]',
    requiredBotPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    callback: async ({ client, message, args, prefix, instance }) => {
        let helpSettings = instance.helpSettings;
        let allCommands = instance.commands;
        let allCategories = instance.categories;
        let authoritativePerms = helpSettings.authoritativePerms;
        if (!args[0]) {

            let isHavePerm = false
            for (let i = 0; i < authoritativePerms.length; i++) {
                let perm = authoritativePerms[i];
                if (message.member.hasPermission(perm)) isHavePerm = true
                else continue;
            }

            let title = await instance.getMessage(message.guild, "HELP_TITLE", { PREFIX: prefix })
            let description = await instance.getMessage(message.guild, "HELP_DESCRIPTION", { PREFIX: prefix })
            if (isHavePerm === true) {
                let categories = allCategories;
                const embed = new DiscordJS.MessageEmbed()
                    .setTitle(title)
                    .setDescription(description)
                    .setFooter(message.member.user.tag)
                    .setColor(helpSettings.embed.color)
                    .setTimestamp();
                for (let category of categories) {
                    let commands = allCommands.filter(c => c.category === category[1].name);
                    let text = "";
                    if (commands.size === 0) continue
                    commands.forEach(command => {
                        text += `\`${command.name || command.secondName}\` `
                    })

                    let emoji = category[1].emoji;

                    if (category[1].custom === true && emoji) emoji = client.emojis.cache.find(e => e.id === emoji);

                    embed.addField(`${emoji ? `**${emoji} - ${category[1].name}**` : `**${category[1].name}**`}`, text);
                }
                return message.channel.send({ embed: embed });

            } else {
                let categories = allCategories.filter(c => c.hidden === false);
                const embed = new DiscordJS.MessageEmbed()
                    .setTitle(title)
                    .setDescription(description)
                    .setFooter(message.member.user.tag)
                    .setColor(helpSettings.embed.color)
                    .setTimestamp();
                for (let category of categories) {
                    let commands = allCommands.filter(c => c.category === category[1].name);
                    let text = "";
                    if (commands.size === 0) continue
                    commands.forEach(command => {
                        text += `\`${command.name || command.secondName}\` `
                    })

                    let emoji = category[1].emoji;

                    if (category[1].custom === true && emoji) emoji = client.emojis.cache.find(e => e.id === emoji);

                    embed.addField(`${emoji ? `**${emoji} - ${category[1].name}**` : `**${category[1].name}**`}`, text);
                }
                return message.channel.send({ embed: embed });
            }
        } else {
            let command = instance.getCommand(args[0]);
            let aliasesText = "`"

            if (typeof command.aliases === 'object') {
                let text = command.aliases.join("` `")
                aliasesText += `${text}\``
            } else if (typeof command.aliases === 'string') {
                aliasesText = `\`${command.aliases}\``;
            }
            const embed = new DiscordJS.MessageEmbed()
                .setTitle('Command Details:')
                .setColor(helpSettings.embed.color)
                .addField("Command:", `\`${command.name || command.secondName}\``)
                .addField("Aliases:", `${command.aliases ? `${aliasesText}` : `No aliases for this command.`}`)
                .addField("Usage:", `\`${prefix}${command.name || command.secondName} ${command.expectedArgs ? `${command.expectedArgs}` : ""}\``)
                .addField("Category:", `${command.category ? `\`${command.category}\`` : `No category for this command.`}`)
                .addField("Description:", `${command.description ? `\`${command.description}\`` : `No description for this command.`}`)

            return message.channel.send({ embed: embed })
        }
    }
}