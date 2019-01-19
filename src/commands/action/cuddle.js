const { Command } = require('discord-akairo');
const NekosClient = require('nekos.life');
const { sfw } = new NekosClient();

class CuddleCommand extends Command {
	constructor() {
		super('cuddle', {
			aliases: ['cuddle'],
			cooldown: 5000,
			ratelimit: 3,
			category: 'action',
			channel: 'guild',
			description: {
				content: 'Cuddles the specified user/users.',
				examples: ['@Abady', '@Abady @Flart'],
				usage: '@user1 / @user2 ...'
			}
		});
	}

	/**
	*
	* @param {import('discord.js').Message} message
	*/
	async exec(message) {
		const { users } = message.mentions;
		users.filter(user => user.id !== this.client.user.id);
		if (users.size < 1) return message.channel.send(`:x: You need to mention a user/users.`);
		if (users.first().bot) return message.channel.send(`:x: You can't do that to bots.`);
		const img = await sfw.cuddle();
		if (users.filter(m => m.id === message.author.id)) return message.channel.send(`:broken_heart: **I feel ya** *${this.id}s*`, { files: [img.url] });
		return message.channel.send(`💬 **${users.map(user => user.username).join(' ')}** you have been ${this.id}d by **${message.author.username}**`, { files: [img.url] });
	}
}
module.exports = CuddleCommand;
