import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			description: {
				content: 'Displays or changes the prefix of the guild.',
				usage: '[prefix]',
				examples: ['*', 'Kitso']
			},
			category: 'util',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'prefix',
					type: 'string'
				}
			]
		});
	}

	public async exec(message: Message, { prefix }: { prefix: string }) {
		// @ts-ignore
		const currentPrefix: string = this.handler.prefix(message);
		if (!prefix) return message.util!.send(`The current prefix for this guild is: \`${currentPrefix}\``);
		if (prefix === currentPrefix) return message.channel.send(`You already have your prefix as: \`${currentPrefix}\` `);
		this.client.settings.set(message.guild, 'prefix', prefix);
		if (prefix === 'k!') {
			return message.util!.reply(`the prefix has been reset to \`${prefix}\``);
		}
		return message.util!.reply(`the prefix has been set to \`${prefix}\``);
	}
}
