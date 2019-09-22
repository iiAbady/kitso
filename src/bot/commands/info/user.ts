import { Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';

export default class UserInfoCommand extends Command {
	public constructor() {
		super('user', {
			aliases: ['user', 'user-info'],
			description: {
				content: 'Get info about a member.',
				usage: '[member]',
				examples: ['Abady', '@! Mirage', '171259176029257728'],
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					match: 'content',
					type: 'member',
					default: (message: Message): GuildMember => message.member,
				},
			],
		});
	}

	public async exec(message: Message, { member }: { member: GuildMember }): Promise<Message | Message[]> {
		const { user } = member;
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setDescription(`Info about **${user.tag}** (ID: ${member.id})`)
			/* tslint:disable:triple-equals */
			.addField(
				'❯ Member Details',
				stripIndents`
				${member.nickname == undefined ? /* eslint-disable-line */ '• No nickname' : ` • Nickname: ${member.nickname}`}
				• Roles: ${member.roles.map((roles): string => `\`${roles.name}\``).join(' ')}
				• Joined at: ${moment.utc(member.joinedAt).format('YYYY/MM/DD hh:mm:ss')}
			`,
			)
			/* tslint:enable:triple-equals */
			.addField(
				'❯ User Details',
				stripIndents`
				• ID: ${member.id}
				• Username: ${member.user.tag}
				• Created at: ${moment.utc(user.createdAt).format('YYYY/MM/DD hh:mm:ss')}${user.bot ? '\n• Bot' : ''}
				• Status: ${user.presence.status.toUpperCase()}
				• Activity: ${
					user.presence.activity
						? user.presence.activity.name === 'Visual Studio Code'
							? '<:vscode:537740663400169498> Visual Studio Code'
							: user.presence.activity.name
						: 'None'
				}
			`,
			)
			.setThumbnail(user.displayAvatarURL());

		return message.util!.send(embed);
	}
}
