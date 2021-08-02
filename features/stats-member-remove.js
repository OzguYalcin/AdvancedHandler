module.exports = async (client) => {
    const Schema = require('../models/stats-schema');
    client.on('guildMemberRemove', async member => {
        let result = await Schema.findByIdAndUpdate(member.guild.id, { _id: member.guild.id }, { upsert: true });

        if (!result.statu || result.statu === null) return;

        let AllMembersCh = member.guild.channels.cache.get(result["all-members"].channelId)

        if (AllMembersCh) {
            await AllMembersCh.setName("All Members: " + member.guild.memberCount);
        }

        if (member.user.bot) {
            let BotsCh = member.guild.channels.cache.get(result["bots"].channelId)

            if (BotsCh) {
                await BotsCh.setName("Bots: " + member.guild.members.cache.filter(m => m.user.bot).size);
            }
        } else {
            let AllMembersCh = member.guild.channels.cache.get(result["members"].channelId)

            if (AllMembersCh) {
                await AllMembersCh.setName("Members: " + member.guild.member.cache.filter(m => !m.user.bot).size);
            }
        }


    })
}