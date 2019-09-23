import { Argument, Command } from 'discord-akairo';
import { Message, GuildMember, User } from 'discord.js';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class CheckCommand extends Command {
	public constructor() {
		super('check', {
			aliases: ['check', 'history'],
			category: 'mod',
			description: {
				content: 'Checks a member history.',
				usage: '<member>',
				examples: ['@Abady'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					match: 'content',
					type: Argument.union(
						'member',
						async (_, phrase): Promise<{ id: string; user: User } | null> => {
							if (!phrase) return null;
							const m = await this.client.users.fetch(phrase);
							if (m) return { id: m.id, user: m };
							return null;
						},
					),
					default: (message: Message): GuildMember => message.member!,
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

	public async exec(message: Message, { member }: { member: GuildMember }): Promise<Message | Message[]> {
		const casesRepo = this.client.db.getRepository(Case);
		const dbCases = await casesRepo.find({ target_id: member.id });
		const embed = Util.historyEmbed(member, dbCases);

		return message.util!.send(embed);
	}
}
