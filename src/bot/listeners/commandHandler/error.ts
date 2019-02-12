import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { emojis } from '../../util/index';
const { shocked, thumbsUp1, thumbsUp2 } = emojis;
const Raven = require('raven'); // tslint:disable-line
const RESPONSES: string[] = [
	`${shocked} W-What?!?! That was unexpected. (Error: !{err})`,
	`${thumbsUp1} Alrrightt! I'am going to fix this asap. (Error: !{err})`,
	`${thumbsUp2} Thank's for finding this bug for me, I'am going to slay it. (Error: !{err})`
];

export default class CommandErrorListener extends Listener {
	public constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	public async exec(error: Error, message: Message, command: Command) {
		this.client.logger.error(`[COMMAND ERROR] ${error.message}`, error.stack);
		Raven.captureBreadcrumb({
			message: 'command_errored',
			category: command ? command.category.id : 'inhibitor',
			data: {
				user: {
					id: message.author.id,
					username: message.author.tag
				},
				guild: message.guild ? {
					id: message.guild.id,
					name: message.guild.name
				} : null,
				command: command ? {
					id: command.id,
					aliases: command.aliases,
					category: command.category.id
				} : null,
				message: {
					id: message.id,
					content: message.content
				}
			}
		});
		Raven.captureException(error);
		return message.util!.send(
			RESPONSES[Math.floor(Math.random() * RESPONSES.length)].replace('!{err}',  `${command.id}${error.message.length + command.id.length}`)
		);
	}
}
