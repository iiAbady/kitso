import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import Util from '../../util';
import { Case } from '../../models/Cases';
const ms = require('@naval-base/ms'); // eslint-disable-line

interface Actions {
	[key: number]: string;
}

const ACTIONS: Actions = {
	1: 'Ban',
	2: 'Unban',
	3: 'Softban',
	4: 'Kick',
	5: 'Mute',
	6: 'Embed restriction',
	7: 'Emoji restriction',
	8: 'Reaction restriction',
	9: 'Warn',
};

export default class CaseCommand extends Command {
	public constructor() {
		super('case', {
			aliases: ['case'],
			category: 'mod',
			description: {
				content: 'Inspect a case, pulled from the database.',
				usage: '<case>',
				examples: ['1234'],
			},
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message): string => `${message.author}, what case do you want to look up?`,
						retry: (message: Message): string => `${message.author}, please enter a case number.`,
					},
				},
			],
		});
	}

	public async exec(message: Message, { caseNum }: { caseNum: number | string }): Promise<Message | Message[]> {
		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : caseNum;
		if (isNaN(caseToFind)) return message.reply('cases are numbers, dummy');
		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = await casesRepo.findOne({ case_id: caseToFind });
		if (!dbCase) {
			return message.reply("I couldn't find a case with that ID");
		}
		const moderator = await message.guild.members.fetch(dbCase.mod_id);
		const color = Object.keys(Util.CONSTANTS.ACTIONS)
			.find((key): boolean => Util.CONSTANTS.ACTIONS[key] === dbCase.action)!
			.split(' ')[0]
			.toUpperCase();
		const embed = new MessageEmbed()
			.setAuthor(`${dbCase.mod_tag} (${dbCase.mod_id})`, moderator ? moderator.user.displayAvatarURL() : '')
			.setColor(Util.CONSTANTS.COLORS[color])
			.setDescription(
				stripIndents`
				**Member:** ${dbCase.target_tag} (${dbCase.target_id})
				**Action:** ${ACTIONS[dbCase.action]}${
					dbCase.action === 5 ? `\n**Length:** ${ms(dbCase.action_duration.getTime(), { long: true })}` : ''
				}
				**Reason:** ${dbCase.reason}${dbCase.ref_id ? `\n**Ref case:** ${dbCase.ref_id}` : ''}
			`,
			)
			.setFooter(`Case ${dbCase.case_id}`)
			.setTimestamp(new Date(dbCase.createdAt));

		return message.util!.send(embed);
	}
}
