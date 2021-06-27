const requiredRolesSchema = require('../models/required-roles-schema');
module.exports = {
    name: 'requiredroles',
    aliases: ['reqroles', 'required-roles', 'reqrole', 'required-role'],
    requiredPermissions: ['ADMINISTRATOR'],
    category: 'Configuration',
    description: 'Specifies what role each command requires.',
    minArgs: 2,
    maxArgs: 2,
    expectedArgs: "[add | remove] [command name] [role id | mention role]",
    guildOnly: true,
    callback: async ({ client, message, args, instance, prefix }) => {
        if(!instance.isDBConnected()) {
            return message.reply(instance.getMessage(instance, "NO_DATABASE_FOUND"));
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
        let command = args[1]
        const isCmdHas = instance.isCommandHas(command, instance);
        if (!isCmdHas) {
            return message.reply(instance.getMessage(instance, "UNKOWN_COMMAND").replace("{COMMAND}", command));
        }
        command = isCmdHas[1]
        if (!role) return message.reply(instance.newSytnaxError(prefix, "requiredroles", "[add | remove] [command name] [role id | mention role]", instance));
        
        if (args[0] === "add") {
        const result = await requiredRolesSchema.findOneAndUpdate({
            guildID: message.guild.id,
            command: command
        }, {
            guildID: message.guild.id,
            command: command,
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        });

        if(result.requiredRoles.includes(role.id)) {
        return message.reply(instance.getMessage(instance, "REQUIRED_ROLE_ALREADY_ADDED").replace("{ROLE}", role.id).replace("{COMMAND}", command))
        }

            await requiredRolesSchema.findOneAndUpdate({
                guildID: message.guild.id,
                command: command
            }, {
                guildID: message.guild.id,
                command: command,
                $addToSet: {
                    requiredRoles: role.id
                }
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            });
        
        return message.reply(instance.getMessage(instance, "ADDED_REQUIRED_ROLE").replace("{ROLE}", role.id).replace("{COMMAND}", command))
        } else if (args[0] === "remove") {
            const result = await requiredRolesSchema.findOneAndUpdate({
                guildID: message.guild.id,
                command: command
            }, {
                guildID: message.guild.id,
                command: command,
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            });
    
            if(!result.requiredRoles.includes(role.id)) {
            return message.reply(instance.getMessage(instance, "REQUIRED_ROLE_ALREADY_REMOVED").replace("{ROLE}", role.id).replace("{COMMAND}", command))
            }

            await requiredRolesSchema.findOneAndUpdate({
                guildID: message.guild.id,
                command: command
            }, {
                guildID: message.guild.id,
                command: command,
                $pull: {
                    requiredRoles: role.id
                }
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            });

            return message.reply(instance.getMessage(instance, "REMOVED_REQUIRED_ROLE").replace("{ROLE}", role.id).replace("{COMMAND}", command))
        } else {
            return message.reply(instance.newSytnaxError(prefix, "requiredroles", "[add | remove] [command name] [role id | mention role]", instance));
        }
    }
}