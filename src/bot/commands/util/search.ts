import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import Yotube, { Video } from 'simple-youtube-api';
const youtube = new Yotube(`${process.env.YOUTUBE}`);

export default class NPMCommand extends Command {
	public constructor() {
		super('npm', {
			aliases: ['npm'],
						category: 'util',
						ownerOnly: true,
			description: {
				content: 'Searches youtube for videos.',
				usage: '<query>',
				examples: ['Funny Video', 'cringe compilation']
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'query',
					prompt: {
						start: (message: Message) => `${message.author}, What would you like to search for in youtube?`
					},
					match: 'content',
					type: query => query ? query.replace(/ /g, ' ') : null
				}
			]
		});
	}

	public async exec(message: Message, { query }: { pkg: string }) {
				const videos =  await youtube.search(query, 10);
				if(!videos) return message.util!.send("Looks like your query video doesn't even exist, you wasted my time!");
				const embed = new MessageEmbed()
								.setColor(0xCB0000)
								.setAuthor('Youtube', 'https://i.imgur.com/uxPFxMC.png', 'https://www.youtube.com/')
								.setColor('RED')
								.addField('Search Results:', `${videos.map(video => video.title)}`);
				return message.util!.send(embed);
	}
}