import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';

export default class BlacklistCommand extends Command {
	public constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'unblacklist'],
			description: {
				content: 'Prohibit/Allow a user from using Kitso.',
				usage: '<user>',
				examples: ['Abady', '@Abady', '171259176029257728'],
			},
			category: 'util',
			ownerOnly: true,
			ratelimit: 2,
			args: [
				{
					id: 'user',
					match: 'content',
					type: 'user',
					prompt: {
						start: (message: Message): string => `${message.author}, who would you like to blacklist/unblacklist?`,
					},
				},
			],
		});
	}

	public async exec(message: Message, { user }: { user: User }): Promise<Message | Message[]> {
		const blacklist = this.client.settings.get('global', 'blacklist', []);
		if (blacklist.includes(user.id)) {
			const index = blacklist.indexOf(user.id);
			blacklist.splice(index, 1);
			if (blacklist.length === 0) this.client.settings.delete('global', 'blacklist');
			else this.client.settings.set('global', 'blacklist', blacklist);

			return message.util!.send(`${user.tag}, have you realized Kitso's greatness? You've got good eyes~`);
		}

		blacklist.push(user.id);
		this.client.settings.set('global', 'blacklist', blacklist);

		return message.util!.send(`${user.tag}, you are not worthy of Kitso's luck~`);
	}
}
