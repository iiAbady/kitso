import { Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildEmoji } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import * as emojis from 'node-emoji';
const punycode = require('punycode'); // eslint-disable-line

const EMOJI_REGEX = /<(?:a)?:(?:\w{2,32}):(\d{17,19})>?/;

export default class EmojiInfoCommand extends Command {
	public constructor() {
		super('emoji', {
			aliases: ['emoji', 'emoji-info'],
			description: {
				content: 'Get information about an emoji.',
				usage: '<emoji>',
				examples: ['😂', ':joy:', '531541224512028684'],
			},
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'emoji',
					match: 'content',
					type: async (message, content) => {
						// eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
						if (EMOJI_REGEX.test(content)) [, content] = content.match(EMOJI_REGEX)!;
						if (!isNaN(content as any)) return message.guild!.emojis.get(content);
						return emojis.find(content);
					},
					prompt: {
						start: (message: Message) => `${message.author}, what emoji would you like information about?`,
						retry: (message: Message) => `${message.author}, please provide a valid emoji!`,
					},
				},
			],
		});
	}

	public async exec(message: Message, { emoji }: { emoji: any }) {
		const embed = new MessageEmbed().setColor(3447003);

		if (emoji instanceof GuildEmoji) {
			embed.setDescription(`Info about ${emoji.name} (ID: ${emoji.id})`);
			embed.setThumbnail(emoji.url);
			embed.addField(
				'❯ Info',
				stripIndents`
				• Identifier: \`<${emoji.identifier}>\`
				• Creation Date: ${moment.utc(emoji.createdAt).format('YYYY/MM/DD hh:mm:ss')}
				• URL: ${emoji.url}
				`,
			);
		} else {
			embed.setDescription(`Info about ${emoji.emoji}`);
			embed.addField(
				'❯ Info',
				stripIndents`
				• Name: \`${emoji.key}\`
				• Raw: \`${emoji.emoji}\`
				• Unicode: \`${punycode.ucs2
					.decode(emoji.emoji)
					.map((e: any): string => `\\u${e.toString(16).toUpperCase()}`)
					.join('')}\`
				`,
			);
		}

		return message.util!.send(embed);
	}
}
