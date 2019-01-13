const { Command } = require('discord-akairo');

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			cooldown: 5000,
			ratelimit: 1,
			category: 'info',
			channelRestriction: 'guild',
			description: {
				content: 'Shows the bot ping.'
			}
		});
	}

	async exec(message) {
		const msg = await message.channel.send(`Pinging...`);
		msg.edit(`:ping_pong: Pong! ${Date.now() - msg.createdTimestamp}ms`);
	}
}


module.exports = PingCommand;
