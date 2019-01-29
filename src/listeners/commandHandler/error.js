const { Listener } = require('discord-akairo');
const Raven = require('raven');

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
	}
}
module.exports = ErrorListner;
