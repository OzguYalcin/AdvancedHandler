const CommandHandler = require('../CommandHandler')
module.exports = async (client) => {
    const Schema = require('../models/stats-schema');
    client.on('guildMemberRemove', async member => {
        let result = await Schema.findByIdAndUpdate(member.guild.id, { _id: member.guild.id }, { upsert: true });

        if (!result.statu || result.statu === null) return;

        let AllMembersCh = member.guild.channels.cache.get(result["all-members"].channelId)

        if (AllMembersCh) {
            await AllMembersCh.setName(await CommandHandler.prototype.getCounterName("all-members", member.guild));
        }

        if (member.user.bot) {
            let BotsCh = member.guild.channels.cache.get(result["bots"].channelId)

            if (BotsCh) {
                await BotsCh.setName(await CommandHandler.prototype.getCounterName("bots", member.guild));
            }
        } else {
            let AllMembersCh = member.guild.channels.cache.get(result["members"].channelId)

            if (AllMembersCh) {
                await AllMembersCh.setName(await CommandHandler.prototype.getCounterName("members", member.guild));
            }
        }


    })
}