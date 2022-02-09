const requiredRolesSchema = require('../models/required-roles-schema');
module.exports = {
    aliases: ['reqroles', 'requiredroles', 'reqrole', 'required-role'],
    requiredPermissions: ['ADMINISTRATOR'],
    category: 'Configuration',
    description: 'Specifies what role each command requires.',
    usage: {
        minArgs: 1,
        maxArgs: 3,
        params: [
            "<add | remove | clean>",
            "[command]",
            "[roleId | mentioned role]"
        ]
    },
    guildOnly: true,
    cooldown: '3s',
    callback: async ({ client, message, args, instance, prefix }) => {
        if (!instance.isDbConnected()) {
            return message.reply(await instance.getMessage(message.guild, "NO_DATABASE_FOUND"));
        } else {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            let command = args[1]

            if (!command && (args[0].toLocaleLowerCase() === "add" || args[0].toLocaleLowerCase() === "remove")) {
                return message.reply(await instance.createSyntaxError(message, "requiredroles", 1, "REQUIRED_PARAM"));
            }

            if (command && (args[0].toLocaleLowerCase() === "add" || args[0].toLocaleLowerCase() === "remove")) {
                const isCmdHas = instance.isCommandHas(command);
                if (!isCmdHas) {
                    return message.reply(await instance.getMessage(message.guild, "UNKOWN_COMMAND", { COMMAND: command.name }));
                }
                command = instance.getCommand(command)
                if (!role && (args[0].toLocaleLowerCase() === "add" || args[0].toLocaleLowerCase() === "remove")) {
                    return message.reply(await instance.createSyntaxError(message, "requiredroles", 2, "REQUIRED_PARAM"));
                }
            }
            if (args[0].toLocaleLowerCase() === "add") {
                const result = await requiredRolesSchema.findOneAndUpdate({
                    guildId: message.guild.id,
                    command: command.name
                }, {
                    guildId: message.guild.id,
                    command: command.name,
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });

                if (result.requiredRoles.includes(role.id)) {
                    return message.reply(await instance.getMessage(message.guild, "REQUIRED_ROLE_ALREADY_ADDED", { ROLE: role.name, COMMAND: command.name }))
                }

                await requiredRolesSchema.findOneAndUpdate({
                    guildId: message.guild.id,
                    command: command.name
                }, {
                    guildId: message.guild.id,
                    command: command.name,
                    $addToSet: {
                        requiredRoles: role.id
                    }
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });

                return message.reply(await instance.getMessage(message.guild, "ADDED_REQUIRED_ROLE", { ROLE: role.name, COMMAND: command.name }))
            } else if (args[0].toLocaleLowerCase() === "remove") {
                const result = await requiredRolesSchema.findOneAndUpdate({
                    guildId: message.guild.id,
                    command: command.name
                }, {
                    guildId: message.guild.id,
                    command: command.name,
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });
                if (!result.requiredRoles.includes(role.id)) {
                    return message.reply(await instance.getMessage(message.guild, "REQUIRED_ROLE_ALREADY_REMOVED", { ROLE: role.name, COMMAND: command.name }))
                }

                await requiredRolesSchema.findOneAndUpdate({
                    guildId: message.guild.id,
                    command: command.name
                }, {
                    guildId: message.guild.id,
                    command: command.name,
                    $pull: {
                        requiredRoles: role.id
                    }
                }, {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                });

                return message.reply(await instance.getMessage(message.guild, "REMOVED_REQUIRED_ROLE", { ROLE: role.name, COMMAND: command.name }))
            } else if (args[0].toLocaleLowerCase() === "clean") {
                await requiredRolesSchema.deleteMany({})

                return message.reply(await instance.getMessage(message.guild, "ALL_REQUIRED_ROLES_DELETED"))
            } else { return message.reply(await instance.createSyntaxError(message, "requiredroles", 0, "INCORRECT_USAGE")); }
        }
    }
}