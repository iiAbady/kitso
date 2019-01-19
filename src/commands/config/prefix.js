const { Command } = require('discord-akairo');
const { Message } = require('discord.js'); // eslint-disable-line no-unused-vars

class PrefixCommand extends Command {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			channel: 'guild',
			cooldown: 5000,
			ratelimit: 3,
			userPermissions: 'MANAGE_GUILD',
			category: 'config',
			args: [
				{
					'id': 'newPrefix',
					'default': null,
					'index': 0,
					'match': 'phrase',
					'type': 'lowercase'
				}
			]
		});
	}

	/**
     *
     * @param {Message} message
     */
	exec(message, { newPrefix }) {
		if (newPrefix) {
			if (newPrefix.length > 5) return message.channel.send(`:x: The prefix must be between 1 to 5 letters.`);
			this.client.settings.set(message.guild.id, 'prefix', newPrefix);
			return message.channel.send(`👍 Alright, I've changed the prefix for thig guild to: \`${newPrefix.toLowerCase()}\``);
		}
		return message.channel.send(`The prefix for this server is: \`\`${this.handler.prefix(message)}\`\``);
	}
}

module.exports = PrefixCommand;

