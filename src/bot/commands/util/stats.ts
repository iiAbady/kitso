import { Command, version as daversion } from 'discord-akairo';
import { Message, MessageEmbed, version as djsversion } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';

const { version } = require('../../../../package.json'); // eslint-disable-line

export default class StatsCommand extends Command {
	public constructor() {
		super('stats', {
			aliases: ['stats'],
			description: {
				content: 'Displays statistics about the bot.',
			},
			category: 'util',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`**${this.client.user!.username} ${version} Stats**`)
			.addField('❯ Uptime', moment.duration(this.client.uptime!).format('d[d ]h[h ]m[m ]s[s]'), true)
			.addField('❯ Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
			.addField(
				'❯ General Stats',
				stripIndents`
				• Guilds: ${this.client.guilds.size}
				• Channels: ${this.client.channels.size}
			`,
				true,
			)
			.addField(
				'❯ Library',
				stripIndents`
				[discord.js](https://github.com/discordjs/discord.js/tree/stable) **::** ${djsversion}
				[akairo](https://github.com/1Computer1/discord-akairo/tree/master) **::** ${daversion}
				`,
				true,
			)
			.setThumbnail(this.client.user!.displayAvatarURL())
			.setFooter(`© 2019 ${this.client.users.get('171259176029257728')!.tag}`);
		return message.util!.send(embed);
	}
}
