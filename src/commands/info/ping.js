const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

const RESPONSES = [
	'Try again lover ~_~',
	'Nope',
	'5$ and I\'ll show you the ping?',
	stripIndents`:ping_pong: Pong! \`$(ping)ms\`
		Heartbeat: \`$(heartbeat)ms\``
];

class PingCommand extends Command {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			ratelimit: 2,
			category: 'info',
			channel: 'guild',
			description: {
				content: 'Shows the bot ping.'
			}
		});
	}

	/**
	 *
	 * @param {import('discord.js').Message} message
	 */
	async exec(message) {
		const msg = await message.channel.send(`Pinging...`);
		return msg.edit(
			RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
				.replace('$(ping)', ((msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)).toString())
				.replace('$(heartbeat)', Math.round(this.client.ws.ping || this.client.ping).toString())
		);
	}
}


module.exports = PingCommand;
