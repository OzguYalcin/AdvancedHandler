const DiscordJS = require('discord.js');
const commandSchema = require('../models/command-schema.js');
module.exports = {
    usage: {
        minArgs: 1,
        maxArgs: 2,
        params: [
            "<enable | disable | clean>",
            "[command]"
        ]
    },
    cooldown: '3s',
    category: 'Configuration',
    description: 'Makes a command enable or disable for this guild',
    requiredPermissions: ['ADMINISTRATOR'],
    guildOnly: true,
    callback: async ({ client, message, args, prefix, instance }) => {
        let guild = message.guild;
        if (!instance.isDbConnected()) {
            return message.reply(await instance.getMessage(guild, "NO_DATABASE_FOUND"));
        }

        let choice = args[0].toLocaleLowerCase();
        let command = args[1] ? args[1].toLocaleLowerCase() : undefined

        if (choice !== 'clean' && !instance.isCommandHas(command)) {
            return message.reply(await instance.getMessage(guild, "UNKOWN_COMMAND", { COMMAND: command }));
        }

        command = command ? instance.getCommand(args[1].toLocaleLowerCase()) : command
        const commandName = command ? command.name : undefined;
        let isCommandDisabled = command ? await instance.isCommandDisabled(guild, commandName) : undefined;
        if (choice === 'clean') {
            const disableCommands = await commandSchema.find({ guildId: guild.id });
console.log(disableCommands)
            disableCommands.forEach(async (item) => {
                console.log(item)
               const deleteDisableCommand =  await commandSchema.findOneAndDelete({ guildId: guild.id, command: item.command });
               console.log(deleteDisableCommand)
            })
            return message.reply(await instance.getMessage(guild, "DISABLE_COMMANDS_CLEANED"))
        } else
            if (choice === 'enable' && !isCommandDisabled) {
                return message.reply(await instance.getMessage(guild, "COMMAND_ALREADY_ENABLED", { COMMAND: commandName }));
            } else if (choice === 'enable' && isCommandDisabled) {
                await commandSchema.findOneAndDelete({ guildId: guild.id, command: commandName })
                return message.reply(await instance.getMessage(guild, "COMMAND_NOW_ENABLED", { COMMAND: commandName }));
            } else if (choice === 'disable' && isCommandDisabled) {
                return message.reply(await instance.getMessage(guild, "COMMAND_ALREADY_DISABLED", { COMMAND: commandName }))
            } else if (choice === 'disable' && !isCommandDisabled) {
                if (commandName.toLocaleLowerCase() === 'command') {
                    return message.reply(await instance.getMessage(guild, "THIS_COMMAND_CAN_NOT_BE_DISABLE", {
                        COMMAND: "command"
                    }))
                }
                new commandSchema({
                    guildId: guild.id,
                    command: commandName
                }).save()

                return message.reply(await instance.getMessage(guild, "COMMAND_NOW_DISABLED", { COMMAND: commandName }))
            } else if (!['enable', 'disable', 'clean'].includes(choice)) {
                return message.reply(await instance.newSyntaxError(message, "command", 0))
            } else {
                return message.reply(await instance.getMessage(guild, "SOMETHINK_WENT_WRONG"))
            }
    }
}