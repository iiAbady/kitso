import { Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import Util from '../../util';
const ms = require('@naval-base/ms'); // tslint:disable-line

export default class MuteCommand extends Command {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'mod',
			description: {
				content: 'Close mouth (keyboard) of a member',
				usage: '<member> <duration> <...reason>',
				examples: ['@Abady', 'Abady 1d Not good boy']
			},
			channel: 'guild',
						clientPermissions: ['MANAGE_ROLES'],
						userPermissions: ['MANAGE_GUILD', 'MANAGE_MESSAGES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message) => `${message.author}, What member do you want to mute?`,
						retry: (message: Message) => `${message.author}, please mention a member.`
					}
				},
				{
					id: 'duration',
					type: (_, str) => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message) => `${message.author}, for how long do you want the mute to last?`,
						retry: (message: Message) => `${message.author}, please use a proper time format.`
					}
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: ''
				}
			]
		});
	}

	public async exec(message: Message, { member, duration, reason }: { member: GuildMember, duration: number, reason: string }) {
		const muteRole = '562125212976545817';
		if (!muteRole) return message.reply('I cannot find the mute role.');

		const key = `${message.guild.id}:${member.id}:MUTE`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('User is getting the law by someone else.');
		}
		this.client.cachedCases.add(key);

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) as number + 1;

		try {
			await member.roles.add(muteRole, `Muted by ${message.author.tag} | Case #${totalCases}`);
		} catch (error) {
			this.client.cachedCases.delete(key);
			return message.reply(`Error occur while muting this member: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = '559070713181372446';
		let modMessage;
		if (modLogChannel) {
			const embed = Util.logEmbed({ message, member, action: 'Mute', duration, caseNum: totalCases, reason }).setColor(Util.CONSTANTS.COLORS.MUTE);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed) as Message;
		}

		await this.client.muteScheduler.addMute({
			guild: message.guild.id,
			// @ts-ignore
			message: modMessage ? modMessage.id : null,
			case_id: totalCases,
			target_id: member.id,
			target_tag: member.user.tag,
			mod_id: message.author.id,
			mod_tag: message.author.tag,
			action: Util.CONSTANTS.ACTIONS.MUTE,
			action_duration: new Date(Date.now() + duration),
			action_processed: false,
			reason
		});

		return message.util!.send(`Successfully muted **${member.user.tag}**`);
	}
}
