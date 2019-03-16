import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
const blocksmc = require('blocksmc'); //tslint:disable-line

export default class Searchcommand extends Command {
	public constructor() {
		super('blocksmc', {
			aliases: ['blocks', 'blocksmc'],
						category: 'util',
			description: {
				content: 'Gives you the leaderboard of a game in BlocksMC.',
				usage: '<game>',
				examples: ['sky-wars']
			},
			clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			args: [
				{
					id: 'query',
					prompt: {
						start: (message: Message) => `${message.author}, What game you want to get its leaderboard?`
					},
					match: 'content',
					type: query => query ? query.replace(/ /g, ' ') : null
				}
			]
		});
	}

	public async exec(message: Message, { query }: { query: string }) {
				const leader =  await blocksmc.top(query);
				if(!leader || !leader.length) return message.util!.send("Looks like I couldn't find any game with that name in BlocksMC.");
				const embed = new MessageEmbed()
																.setColor('BLUE')
																.setDescription(leader.map((player: any) => player).join('\n'));
				return message.util!.send(embed);
	}
}
