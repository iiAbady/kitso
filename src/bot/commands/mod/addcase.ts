import { Argument, Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel, User } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class AddCaseCommand extends Command {
	public constructor() {
		super('addcase', {
			aliases: ['addcase'],
			category: 'mod',
			description: {
				content: 'Add a case',
				usage: '<member> <action> <reason>',
				examples: ['@Abady mute saying bad words'],
			},
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: Argument.union(
						'member',
						async (_, phrase): Promise<{ id: string; user: User } | null> => {
							if (!phrase) return null;
							const m = await this.client.users.fetch(phrase);
							if (m) return { id: m.id, user: m };
							return null;
						},
					),
					prompt: {
						start: (message: Message): string => `${message.author}, what member do you want to add case to?`,
						retry: (message: Message): string => `${message.author}, please mention a member.`,
					},
				},
				{
					id: 'action',
					type: ['ban', 'mute', 'warn', 'kick'],
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: '',
				},
			],
		});
	}

	// tslint:disable-next-line: no-empty
	public async exec(
		message: Message,
		{ member, action, reason }: { member: GuildMember; action: string; reason: string },
	): Promise<Message | Message[]> {
		if (!member) {
			return message.reply('Please mention the target member.');
		}
		if (!action) return message.reply('Choose one of these reasons: **ban, mute, warn, kick**.');
		const totalCases = (this.client.settings.get(message.guild, 'caseTotal', 0) as number) + 1;
		if (!reason) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = '559070713181372446';
		let modMessage;
		const casesRepo = this.client.db.getRepository(Case);
		if (modLogChannel) {
			const embed = Util.logEmbed({ message, member, action, caseNum: totalCases, reason }).setColor(
				Util.CONSTANTS.COLORS[action.toUpperCase()],
			);
			modMessage = (await (this.client.channels.get(modLogChannel) as TextChannel).send(embed)) as Message;
		}

		const dbCase = new Case();
		dbCase.guild = message.guild.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author.id;
		dbCase.mod_tag = message.author.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS[action.toUpperCase()];
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return message.channel.send(`Successfully added a case of **${member.user.tag}**`);
	}
}
