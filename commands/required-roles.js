const requiredRolesSchema = require('../models/required-roles-schema');
module.exports = {
    name: 'required-roles',
    aliases: ['reqroles', 'requiredroles', 'reqrole', 'required-role'],
    requiredPermissions: ['ADMINISTRATOR'],
    category: 'Configuration',
    description: 'Specifies what role each command requires.',
    minArgs: 3,
    maxArgs: 3,
    expectedArgs: "[add | remove] [command name] [role id | mention role]",
    guildOnly: true,
    cooldown: '3s',
    callback: async ({ client, message, args, instance, prefix }) => {
        if (!instance.isDBConnected()) {
            return message.reply(await instance.getMessage(message.guild, "NO_DATABASE_FOUND"));
        } else {

            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            let command = args[1]
            const isCmdHas = instance.isCommandHas(command);
            if (!isCmdHas) {
                return message.reply(await instance.getMessage(message.guild, "UNKOWN_COMMAND", { COMMAND: command.name }));
            }
            command = instance.getCommand(command)
            if (!role) return message.reply(await instance.newSyntaxError(message.guild, "requiredroles", "[add | remove] [command name] [role id | mention role]"));

            if (args[0] === "add") {
                const result = await requiredRolesSchema.findOneAndUpdate({
                    guildID: message.guild.id,
                    command: command.name
                }, {
                    guildID: message.guild.id,
                    command: command.name,
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });

                if (result.requiredRoles.includes(role.id)) {
                    return message.reply(await instance.getMessage(message.guild, "REQUIRED_ROLE_ALREADY_ADDED", { ROLE: role.id, COMMAND: command.name }))
                }

                await requiredRolesSchema.findOneAndUpdate({
                    guildID: message.guild.id,
                    command: command.name
                }, {
                    guildID: message.guild.id,
                    command: command.name,
                    $addToSet: {
                        requiredRoles: role.id
                    }
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });

                return message.reply(await instance.getMessage(message.guild, "ADDED_REQUIRED_ROLE", { ROLE: role.id, COMMAND: command.name }))
            } else if (args[0] === "remove") {
                const result = await requiredRolesSchema.findOneAndUpdate({
                    guildID: message.guild.id,
                    command: command.name
                }, {
                    guildID: message.guild.id,
                    command: command.name,
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });
                if (!result.requiredRoles.includes(role.id)) {
                    return message.reply(await instance.getMessage(message.guild, "REQUIRED_ROLE_ALREADY_REMOVED", { ROLE: role.id, COMMAND: command.name }))
                }

                await requiredRolesSchema.findOneAndUpdate({
                    guildID: message.guild.id,
                    command: command.name
                }, {
                    guildID: message.guild.id,
                    command: command.name,
                    $pull: {
                        requiredRoles: role.id
                    }
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });

                return message.reply(await instance.getMessage(message.guild, "REMOVED_REQUIRED_ROLE", { ROLE: role.id, COMMAND: command.name }))
            } else {
                return message.reply(await instance.newSyntaxError(message.guild, "requiredroles", "[add | remove] [command name] [role id | mention role]"));
            }
        }
    }
}