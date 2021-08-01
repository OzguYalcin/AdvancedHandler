const DiscordJS = require('discord.js');
const CommandSchema = require('../models/command-schema');
module.exports = {
    name: 'command',
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: '[enable | disable] [command]',
    cooldown: '3s',
    category: 'Configuration',
    description: 'Makes a command enable or disable for this guild',
    requiredPermissions: ['ADMINISTRATOR'],
    guildOnly: true,
    callback: async ({ client, message, args, prefix, instance }) => {
        let guild = message.guild;
        if (!instance.isDBConnected()) {
            return message.reply(await instance.getMessage(guild, "NO_DATABASE_FOUND"));
        }

        let choice = args[0].toLocaleLowerCase();
        let command = args[1].toLocaleLowerCase();

        if (!instance.isCommandHas(command)) {
            return message.reply(await instance.getMessage(guild, "UNKOWN_COMMAND", { COMMAND: command }));
        }

        command = instance.getCommand(args[1].toLocaleLowerCase());
        const commandName = command.name;
        let isCommandDisabled = await instance.isCommandDisabled(guild, commandName)

        if (choice === 'enable' && !isCommandDisabled) {
            return message.reply(await instance.getMessage(guild, "COMMAND_ALREADY_ENABLED", { COMMAND: commandName }));
        } else if (choice === 'enable' && isCommandDisabled) {
            await CommandSchema.findOneAndDelete({ guildID: guild.id, command: commandName })
            return message.reply(await instance.getMessage(guild, "COMMAND_NOW_ENABLED", { COMMAND: commandName }));
        } else if (choice === 'disable' && isCommandDisabled) {
            return message.reply(await instance.getMessage(guild, "COMMAND_ALREADY_DISABLED", { COMMAND: commandName }))
        } else if (choice === 'disable' && !isCommandDisabled) {
            if (commandName.toLocaleLowerCase() === 'command') {
                return message.reply(await instance.getMessage(guild, "THIS_COMMAND_CAN_NOT_BE_DISABLE", {
                    COMMAND: "command"
                }))
            }
            new CommandSchema({
                guildID: guild.id,
                command: commandName
            }).save()

            return message.reply(await instance.getMessage(guild, "COMMAND_NOW_DISABLED", { COMMAND: commandName }))
        } else if (!['enable', 'disable'].includes(choice)) {
            return message.reply(await instance.newSyntaxError(guild, commandName, '[enable | disable] [command]'))
        } else {
            return message.reply(await instance.getMessage(guild, "SOMETHINK_WENT_WRONG"))
        }
    }
}