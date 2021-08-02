const StatsSchema = require('../models/stats-schema');

module.exports = {
    name: 'stats',
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "[on | off]",
    category: "Statistics",
    description: "Make stats on or off.",
    guildOnly: true,
    requiredPermissions: ['ADMINISTRATOR'],
    requiredBotPermissions: ['MANAGE_GUILD'],
    callback: async ({ client, message, args, instance, prefix }) => {
        let guild = message.guild
        if (!instance.isDBConnected()) {
            return message.reply(await instance.getMessage(guild, "NO_DATABASE_FOUND"));
        }

        let choose = args[0].toLocaleLowerCase();

        let result = await StatsSchema.findOneAndUpdate({ _id: guild.id }, { _id: guild.id }, { upsert: true, new: true, setDefaultsOnInsert: true })

        if (!["on", "off"].includes(choose)) {
            return message.reply(await instance.newSyntaxError(guild, "stats", "[on | off]"));
        }

        if (await instance.isStatsOn(guild) && choose === "on") {
            return message.reply(await instance.getMessage(guild, "STATS_ALREADY_ON"))
        }
        if (!await instance.isStatsOn(guild) && choose === "off") {
            return message.reply(await instance.getMessage(guild, "STATS_ALREADY_OFF"))
        }

        if (choose === "on") {
            let category = await guild.channels.create("📊 Server Stats", {
                type: 'category', permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ["CONNECT"]
                    },
                    {
                        id: client.user.id,
                        allow: ["MANAGE_CHANNELS"]
                    }
                ],
            });
            let AllMembersCh = await guild.channels.create("All Members: " + guild.memberCount, {
                type: 'voice',
                parent: category,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ["CONNECT"]
                    },
                    {
                        id: client.user.id,
                        allow: ["MANAGE_CHANNELS"]
                    }
                ]
            });
            let MembersCh = await guild.channels.create("Members: " + guild.members.cache.filter(m => !m.user.bot).size, {
                type: 'voice',
                parent: category,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ["CONNECT"]
                    },
                    {
                        id: client.user.id,
                        allow: ["MANAGE_CHANNELS"]
                    }
                ]
            });
            let BotsCh = await guild.channels.create("Bots: " + guild.members.cache.filter(m => m.user.bot).size, {
                type: 'voice',
                parent: category,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: ["CONNECT"]
                    },
                    {
                        id: client.user.id,
                        allow: ["MANAGE_CHANNELS"]
                    }
                ]
            });
            category.setPosition(0)
            await StatsSchema.findOneAndUpdate({ _id: guild.id }, {
                statu: true,
                bots: {
                    channelId: BotsCh.id,
                },
                members: {
                    channelId: MembersCh.id,
                },
                "all-members": {
                    channelId: AllMembersCh.id,
                }

            }, {
                upsert: true
            })
            return message.reply(await instance.getMessage(guild, "STATS_ON"));
        } else {
            await StatsSchema.findOneAndUpdate({ _id: guild.id }, {
                statu: false,
            }, {
                upsert: true
            })
            return message.reply(await instance.getMessage(guild, "STATS_OFF"));

        }

    }
}