import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Case } from '../../models/Cases';

export default class ReasonCommand extends Command {
	public constructor() {
		super('reason', {
			aliases: ['reason'],
			category: 'mod',
			description: {
				content: 'Sets/Updates the reason of a modlog entry.',
				usage: '<case> <...reason>',
				examples: ['1234 dumb', 'latest dumb']
			},
			channel: 'guild',
						clientPermissions: ['MANAGE_ROLES'],
						userPermissions: ['MANAGE_GUILD', 'MANAGE_MESSAGES'],
			ratelimit: 2,
			args: [
				{
					id: 'caseNum',
					type: Argument.union('number', 'string'),
					prompt: {
						start: (message: Message) => `${message.author}, what case do you want to add a reason to?`,
						retry: (message: Message) => `${message.author}, please enter a case number.`
					}
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string'
				}
			]
		});
	}

	public async exec(message: Message, { caseNum, reason }: { caseNum: number | string, reason: string }) {
		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0);
		const caseToFind = caseNum === 'latest' || caseNum === 'l' ? totalCases : caseNum;
		if (isNaN(caseToFind)) return message.reply('cases are numbers, dummy');
		const casesRepo = this.client.db.getRepository(Case);
		const dbCase = await casesRepo.findOne({ case_id: caseToFind });
		if (!dbCase) {
			return message.reply('I couldn\'t find a case with that ID');
		}
		if (dbCase.mod_id && (dbCase.mod_id !== message.author.id && !message.member.permissions.has('MANAGE_GUILD'))) {
			return message.reply('appears you can\'t do this boy.');
		}

		const modLogChannel = '559070713181372446';
		if (modLogChannel) {
			const caseEmbed = await (this.client.channels.get(modLogChannel) as TextChannel).messages.fetch(dbCase.message);
			if (!caseEmbed) return message.reply('looks like the message doesn\'t exist anymore!');
			const embed = new MessageEmbed(caseEmbed.embeds[0]);
			embed.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
				.setDescription(caseEmbed.embeds[0].description.replace(/\*\*Reason:\*\* [\s\S]+/, `**Reason:** ${reason}`));
			await caseEmbed.edit(embed);
		}

		dbCase.mod_id = message.author.id;
		dbCase.mod_tag = message.author.tag;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return message.util!.send(`Successfully set reason for case **#${caseToFind}**`);
	}
}
