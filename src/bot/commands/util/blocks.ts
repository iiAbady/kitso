import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
const blocksmc = require('blocksmc'); //tslint:disable-line

export default class Searchcommand extends Command {
	public constructor() {
		super('blocksmc', {
			aliases: ['blocks', 'blocksmc'],
						category: 'util',
			description: {
				content: 'Searches a player on blocksmc and gets data.',
				usage: '<username>',
				examples: ['iAbady', 'xRokz']
			},
			clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			args: [
				{
					id: 'query',
					prompt: {
						start: (message: Message) => `${message.author}, Who would you like to search for in blocksmc?`
					},
					match: 'content',
					type: query => query ? query.replace(/ /g, ' ') : null
				}
			]
		});
	}

	public async exec(message: Message, { query }: { query: string }) {
				const player =  await blocksmc.player(query);
				if(!player) return message.util!.send("Looks like your query username doesn't even exist, you wasted my time!");
				const embed = new MessageEmbed()
								.setColor('BLUE')
								.setAuthor(`[${player.rank}] ${query}`, `https://minotar.net/helm/${query}`, `https://blocksmc.com/player/${query}`)
								.setDescription(`**Hours: ${player.timePlayed}**`);
				player.games.map(async (g: { game: any; stats: { Kills: any; Deaths: any; Played: any; Points: any; Blocks: any; Eggs: any; Wins: any; FireWorks: any; Crates: any; DMs: any; Sponges: any; Beds: any; Rounds: any; Goals: any; }; }) => {
					embed.addField(g.game,
`${g.stats.Kills ? `Kills: ${g.stats.Kills} ` : ''}
${g.stats.Deaths ? `Deaths: ${g.stats.Deaths} ` : ''}
${g.stats.Played ? `Played: ${g.stats.Played} ` : ''}
${g.stats.Points ? `Points: ${g.stats.Points} ` : ''}
`, true);
// tslint:disable-next-line: indent
				});
				return message.util!.send(embed);
	}
}
