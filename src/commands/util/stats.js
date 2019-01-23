const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { library: { version } } = require('../../structures/bot');
const moment = require('moment');
require('moment-duration-format');

class StatsCommand extends Command {
	constructor() {
		super('stats', {
			aliases: ['stats'],
			description: {
				content: 'Displays statistics about the bot.'
			},
			category: 'util',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2
		});
	}

	exec(message) {
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`**${this.client.user.username} v${version} Stats**`)
			.addField('❯ Uptime', moment.duration(this.client.uptime).format('d[d ]h[h ]m[m ]s[s]'), true)
			.addField('❯ Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
			.addField(
				'❯ General Stats',
				stripIndents`
				• Guilds: ${this.client.guilds.size}
				• Users: ${this.client.users.filter(user => !user.bot).size}
			`,
				true
			)
			.addField(
				'❯ Library',
				stripIndents`
				[discord.js](https://github.com/discordjs/discord.js/tree/stable) **::** 12.0.0-dev
				[akairo](https://github.com/1Computer1/discord-akairo/tree/master) **::** 8.0.0-dev
				`,
				true
			)
			.setThumbnail(this.client.user.displayAvatarURL())
			.setFooter(`© 2019 ${this.client.users.get(this.client.ownerID).tag}`);

		return message.channel.send(embed);
	}
}

module.exports = StatsCommand;
