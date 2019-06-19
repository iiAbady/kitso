import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { emojis } from '../../util/index';
const Raven = require('raven'); // eslint-disable-line

const RESPONSE = `${emojis.shocked} W-what?!?! That was unexpected. (Error: !{err})`;

export default class CommandErrorListener extends Listener {
	public constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	public async exec(error: Error, message: Message, command: Command): Promise<Message | Message[]> {
		this.client.logger.error(`[COMMAND ERROR] ${error.message}`, error.stack);
		Raven.captureBreadcrumb({
			message: 'command_errored',
			category: command ? command.category.id : 'inhibitor',
			data: {
				user: {
					id: message.author!.id,
					username: message.author!.tag
				},
				guild: message.guild
					? {
						id: message.guild.id,
						name: message.guild.name
					}
				 : null,
				command: command
					? {
						id: command.id,
						aliases: command.aliases,
						category: command.category.id
					}
					: null,
				message: {
					id: message.id,
					content: message.content
				}
			}
		});
		Raven.captureException(error);
		return message.util!.send(
			RESPONSE
				.replace('!{err}', `${command.id}${error.message.length + command.id.length}`)
		);
	}
}
