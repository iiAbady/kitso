const { Command } = require('discord-akairo');
const { MessageEmbed, GuildEmoji } = require('discord.js');
const { stripIndents } = require('common-tags');
const moment = require('moment');
const punycode = require('punycode');
const emojis = require('node-emoji');

const emojiRegex = /<:\w+:(\d{17,19})>/;
class EmojiInfoCommand extends Command {
	constructor() {
		super('emoji', {
			aliases: ['emoji', 'emoji-info'],
			description: {
				content: 'Get information about an emoji.',
				usage: '<emoji>',
				examples: ['😂', ':joy:', '531541224512028684']
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			category: 'info',
			ratelimit: 2,
			args: [
				{
					id: 'emoji',
					match: 'content',
					type: (content, message) => {
						if (emojiRegex.test(content)) [, content] = content.match(emojiRegex);
						if (!isNaN(content)) return message.guild.emojis.get(content);
						return emojis.find(content);
					},
					prompt: {
						start: message => `${message.author}, what emoji would you like information about?`,
						retry: message => `${message.author}, please provide a valid emoji!`
					}
				}
			]
		});
	}

	exec(message, { emoji }) {
		const embed = new MessageEmbed()
			.setColor(3447003);

		if (emoji instanceof GuildEmoji) {
			embed.setDescription(`${emoji.name}'s info (ID: ${emoji.id})`);
			embed.setThumbnail(emoji.url);
			embed.addField(
				'❯ Info',
				stripIndents`
				• Identifier: \`<${emoji.identifier}>\`
				• Creation Date: ${moment.utc(emoji.createdAt).format('YYYY/MM/DD hh:mm:ss')}
				• URL: ${emoji.url}
				`
			);
		} else {
			embed.setDescription(`Info about ${emoji.emoji}`);
			embed.addField(
				'❯ Info',
				stripIndents`
				• Name: \`${emoji.key}\`
				• Raw: \`${emoji.emoji}\`
				• Unicode: \`${punycode.ucs2.decode(emoji.emoji).map(e => `\\u${e.toString(16).toUpperCase()}`).join('')}\`
				`
			);
		}

		return message.channel.send(embed);
	}
}

module.exports = EmojiInfoCommand;
