import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

const RESPONSES: string[] = [
	'Try again lover ~_~',
	'Nope',
	'5$ and I\'ll show you the ping?',
	stripIndents`:ping_pong: Pong! \`$(ping)ms\`
		Heartbeat: \`$(heartbeat)ms\``
];

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			description: {
				content: 'Shows the bot ping.'
			},
			category: 'util',
			ratelimit: 2
		});
	}

	public async exec(message: Message): Promise<Message | Message[]> {
		const msg = await message.util!.send('Pinging...');

		return message.util!.edit(
			RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
				.replace('$(ping)', ((msg.editedTimestamp || msg.createdTimestamp) - (message.editedTimestamp || message.createdTimestamp)).toString())
				// @ts-ignore
				.replace('$(heartbeat)', Math.round(this.client.ws.ping).toString())
		);
	}
}

module.exports = PingCommand;
