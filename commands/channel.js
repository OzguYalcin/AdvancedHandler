const ChannelSchema = require('../models/channel-schema');
module.exports = {
    usage: {
        maxArgs: 3,
        minArgs: 2  ,
        params: [
            "<enable | disable>",
            "<command | all>",
            "[tag channel | tag channels]"
        ]
    },
    guildOnly: true,
    requiredPermissions: ['ADMINISTRATOR'],
    category: 'Configuration',
    description: 'Enables or disables a command (or all) for a channel or some channel.',
    cooldown: '3s',
    callback: async ({ client, message, args, prefix, instance }) => {
        let guild = message.guild;
        if (!instance.isDbConnected()) {
            return message.reply(await instance.getMessage(guild, "NO_DATABASE_FOUND"));
        }

        let choice = args[0].toLocaleLowerCase();
        let command = args[1].toLocaleLowerCase();
        let channels = message.mentions.channels;
        if (!instance.isCommandHas(command) && command !== 'all') {
            return message.reply(await instance.getMessage(guild, "UNKOWN_COMMAND", {
                COMMAND: command
            }))
        }
        if (channels.size === 0) {
            return message.reply(await instance.createSyntaxError(message, "channel", 2, "REQUIRED_PARAM"));
        }



        if (choice === 'enable') {
            if (command === 'all') {
                instance.commands.forEach(async co => {
                    for (let c of channels) {
                        channel = c[1];

                        // let isChannelDisabled = await instance.isChannelDisabled(guild, command, channel);
                        // if (!isChannelDisabled) {
                        //     return message.reply(await instance.getMessage(guild, 'THIS_CHANNEL_ALREADY_ENABLED', {
                        //         CHANNEL: channel.name
                        //     }))
                        // }

                        await ChannelSchema.findOneAndUpdate(
                            {
                                guildId: guild.id,
                                command: co.name ? co.name : co.secondName
                            }, {
                            $pull: {
                                channels: channel.id
                            }
                        }, {
                            upsert: true
                        })
                    }
                })
                return message.reply(await instance.getMessage(guild, "CHANNEL_NOW_ENABLE_ALL", {
                    CHANNELS: args.slice(2).join(", "),
                    COMMAND: command
                }))
            } else {
                command = instance.getCommand(command)
                for (let c of channels) {
                    channel = c[1];

                    let isChannelDisabled = await instance.isChannelDisabled(guild, command.name, channel);
                    if (!isChannelDisabled) {
                        return message.reply(await instance.getMessage(guild, 'THIS_CHANNEL_ALREADY_ENABLED', {
                            CHANNEL: channel,
                            COMMAND: command.name
                        }))
                    }

                    await ChannelSchema.findOneAndUpdate(
                        {
                            guildId: guild.id,
                            command: command.name
                        }, {
                        $pull: {
                            channels: channel.id
                        }
                    }, {
                        upsert: true
                    })
                }
                return message.reply(await instance.getMessage(guild, "CHANNEL_NOW_ENABLE", {
                    CHANNELS: args.slice(2).join(", "),
                    COMMAND: command.name
                }))

            }
        } else if (choice === 'disable') {
            if (command === 'all') {
                instance.commands.forEach(async co => {
                    if (co.name === 'channel') return;
                    for (let c of channels) {
                        channel = c[1];

                        // let isChannelDisabled = await instance.isChannelDisabled(guild, command, channel);
                        // if (!isChannelDisabled) {
                        //     return message.reply(await instance.getMessage(guild, 'THIS_CHANNEL_ALREADY_ENABLED', {
                        //         CHANNEL: channel.name
                        //     }))
                        // }
                        await ChannelSchema.findOneAndUpdate(
                            {
                                guildId: guild.id,
                                command: co.name ? co.name : co.secondName
                            }, {
                            $addToSet: {
                                channels: channel.id
                            }
                        }, {
                            upsert: true
                        })
                    }
                })
                return message.reply(await instance.getMessage(guild, "CHANNEL_NOW_DISABLE_ALL", {
                    CHANNELS: args.slice(2).join(", "),
                    COMMAND: command
                }))
            } else {
                command = instance.getCommand(command)

                for (let c of channels) {
                    channel = c[1];

                    let isChannelDisabled = await instance.isChannelDisabled(guild, command.name, channel);
                    if (isChannelDisabled) {
                        return message.reply(await instance.getMessage(guild, 'THIS_CHANNEL_ALREADY_DISABLED', {
                            CHANNEL: channel,
                            COMMAND: command.name
                        }))
                    }

                    await ChannelSchema.findOneAndUpdate(
                        {
                            guildId: guild.id,
                            command: command.name
                        }, {
                        $addToSet: {
                            channels: channel.id
                        }
                    }, {
                        upsert: true
                    })
                }
                return message.reply(await instance.getMessage(guild, "CHANNEL_NOW_DISABLE", {
                    CHANNELS: args.slice(2).join(", "),
                    COMMAND: command.name
                }))

            }
        } else {
            return message.reply(await instance.createSyntaxError(message, "requiredroles", 2, "INCORRECT_USAGE"));
        }
    }
}