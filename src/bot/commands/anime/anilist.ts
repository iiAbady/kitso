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
			aliases: ['list', 'mylist'],
			category: 'anime',
			description: {
				content: 'Shows yours/others anilists.',
				usage: '[--type] [page] [user]',
				examples: ['2', 'manga 2', 'anime 2 @Abady']
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					'id': 'page',
					// TODO: have it support emojis
					'type': Argument.compose((_, str): string => str.replace(/\s/g, ''), Argument.range('number', 1, Infinity)),
					'default': 1,
					'unordered': true
				},
				{
					'id': 'member',
					'type': 'member',
					'default': (message: Message): GuildMember => message.member!,
					'unordered': true
				},
				{
					'id': 'type',
					'type': ['anime', 'manga'],
					'match': 'option',
					'flag': '--',
					'default': 'anime'
				}
			]
		});
	}

	public async exec(message: Message, { type, page, member }: { type: string; page: number; member: GuildMember }): Promise<Message | Message[]> {
		if (member!.user.bot) {
			return message.reply(`Didn't know that bots are weebs •_•`);
		}

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
					MediaListCollection(userId: ${user.ani}, type: ${type.toUpperCase()}, status: COMPLETED, sort: SCORE_DESC, forceSingleCompletedList: true) {
						lists {
						  entries {
							score
							media {
							  siteUrl
							  title { romaji }
							}
						  }
						}
					  }
				}`
			})
		})).json();

		if (!lists.length) {
			return message.reply('I can\'t list it for you when you don\'t have any items there ~_~');
		}

		let index = (page - 1) * 10;
		const list = lists[0].entries.slice((page - 1) * 10, page * 10);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author!.username}'s list`, message.author!.displayAvatarURL())
			.setDescription(stripIndents`
							**${type.replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())} List:**

							${list ? list.map(item => `**${++index}.** [${item.media.title.romaji}](${item.media.siteUrl}) ― ${item.score}`).join('\n') : '*Nothing here*'}
			`)
			.setFooter(`Page ${page} of ${Math.ceil(lists[0].entries.length / 10)}`)
			.setColor('AQUA');
		return message.util!.send(embed);
	}
}
