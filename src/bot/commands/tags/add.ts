import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Tag } from '../../models/Tags';
import { emojis } from '../../util/index';

export default class TagAddCommand extends Command {
	public constructor() {
		super('tag-add', {
			category: 'tags',
			description: {
				content: 'Adds a tag, usable for everyone on the server (Markdown can be used).',
				usage: '<tag> <content>',
				examples: ['Test Test'],
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					type: 'existingTag',
					prompt: {
						start: (message: Message): string => `${message.author}, what should the tag be named?`,
						retry: (message: Message, { failure }: { failure: { value: string } }): string =>
							`${message.author}, a tag with the name **${failure.value}** already exists.`,
					},
				},
				{
					id: 'content',
					match: 'rest',
					type: 'tagContent',
					prompt: {
						start: (message: Message): string => `${message.author}, what should the content of the tag be?`,
					},
				},
			],
		});
	}

	public async exec(message: Message, { name, content }: { name: any; content: string }): Promise<Message | Message[]> {
		if (name && name.length >= 50) {
			return message.util!.reply('Tags names have a limit of **50** characters only!');
		}
		if (content && content.length >= 1950) {
			return message.util!.reply('Tags contents have a limit of **1950** characters only!');
		}
		const tagsRepo = this.client.db.getRepository(Tag);
		const tag = new Tag();
		tag.user = message.author!.id;
		tag.guild = message.guild!.id;
		tag.name = name;
		tag.hoisted = true;
		tag.content = content;
		await tagsRepo.save(tag);

		return message.util!.reply(
			`${emojis.thumbsup} leave it to me! A tag with the name **${name.substring(0, 50)}** has been added.`,
		);
	}
}
