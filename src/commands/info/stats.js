const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { library } = require('../../structures/bot');
const moment = require('moment');
require('moment-duration-format');

class StatsCommand extends Command {
	constructor() {
		super('stats', {
			aliases: ['stats'],
			description: {
				content: 'Displays statistics about the bot.'
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2
		});
	}

	exec(message) {
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`**${this.client.user.username} Statistics**`)
			.addField('❯ Uptime', moment.duration(this.client.uptime).format('d[d ]h[h ]m[m ]s[s]'), true)
			.addField('❯ Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
			.addField(
				'❯ General Stats',
				stripIndents`
				• Guilds: ${this.client.guilds.size}
				• Channels: ${this.client.channels.size}
				• Users: ${this.client.users.size}
			`,
				true
			)
			.addField(
				'❯ Versions',
				stripIndents`
				• Abayro: v${library.version}
				• Node: ${library.node}
				`,
				true
			)
			.addField(
				'❯ Library',
				stripIndents`
				[discord.js](https://github.com/discordjs/discord.js/tree/stable) › Master@12.0.0-dev
				[akairo](https://github.com/1Computer1/discord-akairo/tree/master) › Master@8.0.0-dev
				`,
				true
			)
			.addField(
				'❯ Developers',
				`${this.client.users.get(this.client.ownerID).tag}`,
				true
			)
			.setThumbnail(this.client.user.avatarURL)
			.setFooter(`© 2019 ${this.client.user.username}`);

		return message.channel.send(embed);
	}
}

module.exports = StatsCommand;
