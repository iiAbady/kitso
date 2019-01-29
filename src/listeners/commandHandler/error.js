const { Listener } = require('discord-akairo');
const Raven = require('raven');
const { emojis: { shocked, thumbsUp1, thumbsUp2 } } = require('../../structures/bot');
const RESPONSES = [
	`${shocked} W-What?!?! That was unexpected. (Error: !{err})`,
	`${thumbsUp1} Alrrightt! I'am going to fix this asap. (Error: !{err})`,
	`${thumbsUp2} Thank's for finding this bug for me, I'am going to slay it. (Error: !{err})`
];

class ErrorListner extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	/**
	 *
	 * @param {Error} error
	 * @param {import('discord.js').Message} message
	 * @param {import('discord-akairo').Command} command
	 */
	exec(error, message, command) {
		this.client.logger.error(error);
		Raven.captureBreadcrumb({
			message: 'command_errored',
			category: command ? command.category.id : 'inhibitor',
			data: {
				user: {
					id: message.author.id,
					username: message.author.tag
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
		return message.channel.send(
			RESPONSES[Math.floor(Math.random() * RESPONSES.length)].replace('!{err}', command.id + error.message.length + command.id.length)
		);
	}
}
module.exports = ErrorListner;
