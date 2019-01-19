const { Command } = require('discord-akairo');
const NekosClient = require('nekos.life');
const { sfw } = new NekosClient();

class HugCommand extends Command {
	constructor() {
		super('hug', {
			aliases: ['hug'],
			cooldown: 5000,
			ratelimit: 3,
			category: 'action',
			channel: 'guild',
			description: {
				content: 'Hugs the specified user/users.',
				examples: ['@Abady', '@Abady @Flart'],
				usage: '@user1 / @user2 ...'
			}
		});
	}

	async exec(message) {
		const { users } = message.mentions;
		users.filter(user => user.id !== this.client.user.id);
		if (users.size < 1) return message.channel.send(`:x: You need to mention a user/users.`);
		if (users.first().bot) return message.channel.send(`:x: You can't do that to bots.`);
		const img = await sfw.hug();
		if (users.filter(m => m.username === message.author.username)) return message.channel.send(`:broken_heart: **I feel ya** *${this.id}s*`, { files: [img.url] });
		return message.channel.send(`💬 **${users.map(user => user.username).join(' ')}** you have been hugged by **${message.author.username}**`, { files: [img.url] });
	}
}
module.exports = HugCommand;
