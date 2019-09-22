import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			description: {
				content: 'Displays or changes the prefix of the guild.',
				usage: '[prefix]',
				examples: ['*', '#'],
			},
			category: 'util',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'prefix',
					type: 'string',
				},
			],
		});
	}

	public async exec(message: Message, { prefix }: { prefix: string }): Promise<Message | Message[]> {
		// @ts-ignore
		const currentPrefix: string = this.handler.prefix(message);
		if (!prefix || !message.member.hasPermission('MANAGE_GUILD'))
			return message.util!.send(`The current prefix for this guild is: \`${currentPrefix}\``);
		if (prefix.length < 1 || prefix.length > 4) return message.util!.send('Prefix length must be between 1 and 4');
		if (prefix === currentPrefix) return message.channel.send(`You already have your prefix as: \`${currentPrefix}\` `);
		this.client.settings.set(message.guild, 'prefix', prefix);
		if (prefix === 'k!') {
			return message.util!.reply(`the prefix has been reset to \`${prefix}\``);
		}
		return message.util!.reply(`the prefix has been set to \`${prefix}\``);
	}
}
