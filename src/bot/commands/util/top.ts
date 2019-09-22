import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { Blocks } from 'blocksmc';
const blocksmc: Blocks = new Blocks();

export default class Searchcommand extends Command {
	public constructor() {
		super('top', {
			aliases: ['top'],
			category: 'util',
			description: {
				content: 'Gives you the leaderboard of a game in BlocksMC.',
				usage: '<game>',
				examples: ['sky-wars'],
			},
			clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			args: [
				{
					id: 'query',
					prompt: {
						start: (message: Message): string => `${message.author}, what game you want to get its leaderboard?`,
					},
					match: 'content',
					type: (_, query): string | null => (query ? query.replace(/ /g, ' ') : null),
				},
			],
		});
	}

	public async exec(message: Message, { query }: { query: string }): Promise<Message | Message[]> {
		const leader = await blocksmc.top(query);
		if (!leader || !leader.length)
			return message.util!.send("Looks like I couldn't find any game with that name in BlocksMC.");
		const embed = new MessageEmbed()
			.setColor('BLUE')
			.setDescription(leader.map((player: any, rank: number): string => `#${rank + 1} ${player}`).join('\n'));
		return message.util!.send(embed);
	}
}
