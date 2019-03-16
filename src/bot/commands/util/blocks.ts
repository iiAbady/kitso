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
				if(!player || !player.length) return message.util!.send("Looks like your query username doesn't even exist, you wasted my time!");
				const embed = new MessageEmbed()
								.setColor('BLUE')
								.setAuthor(query, `https://minotar.net/helm/${query}`, `https://blocksmc.com/player/${query}`);
// tslint:disable-next-line: promise-function-async
				player.map(async (g: { game: any; stats: { Kills: any; Deaths: any; Played: any; Points: any; Blocks: any; Eggs: any; Wins: any; FireWorks: any; Crates: any; DMs: any; Sponges: any; Beds: any; Rounds: any; Goals: any; }; }) => {
					embed.addField(g.game, `${g.stats.Kills ? `Kills: ${g.stats.Kills} ` : ''}
${g.stats.Deaths ? `Deaths: ${g.stats.Deaths} ` : ''}
${g.stats.Played ? `Played: ${g.stats.Played} ` : ''}
${g.stats.Points ? `Points: ${g.stats.Points} ` : ''}
${g.stats.Blocks ? `Blocks: ${g.stats.Blocks} ` : ''}
${g.stats.Eggs ? `Eggs: ${g.stats.Eggs} ` : ''}
${g.stats.Wins ? `Wins: ${g.stats.Wins} ` : ''}
${g.stats.FireWorks ? `FireWorks: ${g.stats.FireWorks} ` : ''}
${g.stats.Crates ? `Crates: ${g.stats.Crates} ` : ''}
${g.stats.DMs ? `DMs: ${g.stats.DMs} ` : ''}
${g.stats.Sponges ? `Sponges: ${g.stats.Sponges} ` : ''}
${g.stats.Beds ? `Beds: ${g.stats.Beds} ` : ''}
${g.stats.Rounds ? `Rounds: ${g.stats.Rounds} ` : ''}
${g.stats.Goals ? `Goals: ${g.stats.Goals} ` : ''}
`);
// tslint:disable-next-line: indent
			  return message.util!.send(embed);
				});
	}
}
