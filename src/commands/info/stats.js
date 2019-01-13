const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

const { library } = require('../../structures/bot');

class StatsCommand extends Command {
	constructor() {
		super('stats', {
			aliases: ['stats'],
			description: {
				content: 'Displays statistics about the bot.'
			},
			category: 'info',
			channelRestriction: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2
		});
	}

	exec(message) {
		const embed = new RichEmbed()
			.setColor(3447003)
			.setDescription(`**${this.client.user.username} Statistics**`)
			.addField('❯ Uptime', moment.duration(this.client.uptime).format('d[d ]h[h ]m[m ]s[s]'), true)
			.addField('❯ Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
			.addField(
				'❯ General Stats',
				`
				• Guilds: ${this.client.guilds.size}
				• Channels: ${this.client.channels.size}
				• Users: ${this.client.users.size}
			`,
				true
			)
			.addField(
				'❯ Versions',
				`• Abayro: v${library.version}\n• Node: ${library.node}`,
				true
			)
			.addField(
				'❯ Library',
				`**[discord.js](https://discord.js.org)**\n**[akairo](https://github.com/1Computer1/discord-akairo/tree/stable)**`,
				true
			)
			.addField(
				'❯ Developers',
				`**${this.client.ownerID.filter(m => m !== '244423000802328576').map(m => this.client.users.get(m).tag).join('\n')}**`,
				true
			)
			.setThumbnail(this.client.user.avatarURL)
			.setFooter(`© 2019 ${this.client.user.username}`);

		return message.channel.send(embed);
	}
}

module.exports = StatsCommand;
