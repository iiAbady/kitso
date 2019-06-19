interface List {
	entries: { score: number; media: { siteUrl: string; title: { romaji: string } } }[];
}

import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import { User } from '../../models/Users';
import { stripIndents } from 'common-tags';
import fetch from 'node-fetch';


export default class ANISYNCCOMMAND extends Command {
	public constructor() {
		super('anilist', {
			aliases: ['mylist', 'anilist'],
			category: 'anime',
			description: {
				content: 'Shows yours/others anilists.'
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					'id': 'page',
					'match': 'content',
					'type': Argument.compose((_, str): string => str.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, Infinity)),
					'default': 1
				},
				{
					'id': 'member',
					'type': 'member',
					'default': (message: Message): GuildMember => message.member!
				}
			]
		});
	}

	public async exec(message: Message, { page, member }: { page: number; member: GuildMember }): Promise<Message | Message[] | void> {
		const usersRepo = this.client.db.getRepository(User);
		const user = await usersRepo.findOne({ user: member!.id });
		if (!user) {
			return message.reply(`Seems ${member.id === message.author!.id ? 'You' : member.user.username} are not synced yet.`);
		}
		const { data: { MediaListCollection: { lists } } }: { data: { MediaListCollection: { lists: Array<List> } } } = await (await fetch('https://graphql.anilist.co', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({
				query: `{
					MediaListCollection(userId: ${user.ani}, type: ANIME, status: COMPLETED, sort: SCORE_DESC, forceSingleCompletedList: true) {
						lists {
						  entries {
							score
							media {
							  siteUrl
							  title {
								romaji
							  }
							}
						  }
						}
					  }
				}`
			})
		})).json();

		let index = (page - 1) * 10;
		const animeList = lists[0].entries.slice((page - 1) * 10, page * 10) || '*Nothing here*';

		const embed = new MessageEmbed()
			.setAuthor(`${message.author!.username}'s list`, message.author!.displayAvatarURL())
			.setDescription(stripIndents`
							**Anime List:**

							${animeList.map(item => `**${++index}.** [${item.media.title.romaji}](${item.media.siteUrl}) ― ${item.score}`).join('\n')}
			`)
			.setFooter(`Page ${page} of ${Math.ceil(lists[0].entries.length / 10)}`)
			.setColor('AQUA');
		return message.util!.send(embed);
	}
}
