import { Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class WarnCommand extends Command {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'mod',
			description: {
				content: 'WAAAAAAAARNS a dude.',
				usage: '<member> <...reason>',
				examples: ['@Abady spam'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: (message: Message): string => `${message.author}, what member do you want to warn?`,
						retry: (message: Message): string => `${message.author}, Please mention a member.`,
					},
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

	// @ts-ignore
	public userPermissions(message: Message): string | null {
		const staffRole = '535380980521893918';
		const hasStaffRole = message.member!.roles.has(staffRole) || message.member!.hasPermission('MANAGE_GUILD');
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	public async exec(
		message: Message,
		{ member, reason }: { member: GuildMember; reason: string },
	): Promise<Message | Message[]> {
		const totalCases = (this.client.settings.get(message.guild!, 'caseTotal', 0) as number) + 1;
		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get(message.guild!, 'modLogChannel', process.env.MOD_CHANNEL);
		let modMessage;
		if (modLogChannel) {
			const embed = Util.logEmbed({ message, member, action: 'Warn', caseNum: totalCases, reason }).setColor(
				Util.CONSTANTS.COLORS.WARN,
			);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
		}

		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = new Case();
		dbCase.guild = message.guild!.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author!.id;
		dbCase.mod_tag = message.author!.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.WARN;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return message.util!.send(`Successfully warned **${member.user.tag}**`);
	}
}
