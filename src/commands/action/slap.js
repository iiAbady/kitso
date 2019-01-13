const { Command } = require('discord-akairo');
const nekoclient = require('nekos.life');
const neko = new nekoclient();

class SlapCommand extends Command {
	constructor() {
		super('slap', {
			aliases: ['slap'],
			cooldown: 5000,
			ratelimit: 3,
			category: 'action',
			channelRestriction: 'guild',
			description: {
				content: 'Slaps the specified user/users.',
				examples: ['@Abady', '@Abady @Flart'],
				usage: '@user1 / @user2 ...'
			}
		});
	}

	async exec(message) {
		const { users } = message.mentions;
		if (users.size < 1) return message.channel.send(`:x: You need to mention a user/users.`);
		if (users.first().bot) return message.channel.send(`:x: You can't do that to bots.`);
		const img = await neko.getSFWSlap();
		if (users.filter(m => m.username === message.author.username)) return message.channel.send(`O-okk??? *${this.id}s you*`, { files: [img.url] });
		return message.channel.send(`💬 **${users.map(user => user.username).join(' ')}** you have been ${this.id}ped by **${message.author.username}**`, { files: [img.url] });
	}
}
module.exports = SlapCommand;
