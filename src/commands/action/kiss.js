const { Command } = require('discord-akairo');
const NekosClient = require('nekos.life');
const neko = new NekosClient();

class KissCommand extends Command {
	constructor() {
		super('kiss', {
			aliases: ['kiss'],
			cooldown: 5000,
			ratelimit: 3,
			category: 'action',
			channel: 'guild',
			description: {
				content: 'Kisses the specified user/users.',
				examples: ['@Abady', '@Abady @Flart'],
				usage: '@user1 / @user2 ...'
			}
		});
	}

	async exec(message) {
		const { users } = message.mentions;
		if (users.size < 1) return message.channel.send(`:x: You need to mention a user/users.`);
		if (users.first().bot) return message.channel.send(`:x: You can't do that to bots.`);
		const img = await neko.getSFWKiss();
		if (users.filter(m => m.username === message.author.username)) return message.channel.send(`:broken_heart: **I feel ya** *${this.id}es*`, { files: [img.url] });
		return message.channel.send(`💬 **${users.map(user => user.username).join(' ')}** you have been ${this.id}ed by **${message.author.username}**`, { files: [img.url] });
	}
}
module.exports = KissCommand;
