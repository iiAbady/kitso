import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { emojis } from '../../util/index';
import { addBreadcrumb, captureException, Severity } from '@sentry/node';

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
		addBreadcrumb({
			message: 'command_errored',
			category: command ? command.category.id : 'inhibitor',
			level: Severity.Error,
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
		captureException(error);
		return message.util!.send(
			RESPONSE
				.replace('!{err}', `${command.id}${error.message.length + command.id.length}`)
		);
	}
}
