import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
const Youtube = require('simple-youtube-api'); // eslint-disable-line
const youtube = new Youtube(process.env.YOUTUBE);

export default class Searchcommand extends Command {
	public constructor() {
		super('search', {
			aliases: ['search'],
			category: 'util',
			description: {
				content: 'Searches youtube for videos.',
				usage: '<query>',
				examples: ['Funny Video', 'cringe compilation'],
			},
			clientPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			args: [
				{
					id: 'query',
					prompt: {
						start: (message: Message): string => `${message.author}, what would you like to search for in youtube?`,
					},
					match: 'content',
					type: (_, query): string | null => (query ? query.replace(/ /g, ' ') : null),
				},
			],
		});
	}

	public async exec(message: Message, { query }: { query: string }): Promise<Message | Message[]> {
		const videos = await youtube.searchVideos(query, 5);
		if (!videos) return message.util!.send("Looks like your query video doesn't even exist, you wasted my time!");
		const embed = new MessageEmbed()
			.setColor(0xcb0000)
			.setAuthor(
				'Youtube',
				'http://mpadelgym.com/public/uploads/mionopadelgym2/icono-youtube1.png',
				'https://www.youtube.com/',
			)
			.setColor('#FF0000')
			.addField(
				'Search Results:',
				`${videos.map((video: any): string => `**[${video.title}](${video.url})**`).join('\n')}`,
			);
		const msg = await message.util!.send({ embed });
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user): boolean => reaction.emoji.name === '🗑' && user.id === message.author!.id,
				{ max: 1, time: 5000, errors: ['time'] },
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first()!.message.delete();

		return message;
	}
}
