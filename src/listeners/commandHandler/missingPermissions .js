const { Listener } = require('discord-akairo');

class MissingPermissionsListner extends Listener {
	constructor() {
		super('missingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
			category: 'commandHandler'
		});
	}

	/**
     * @param {import('discord.js').Message} message
     */
	exec(message, command, type, missing) {
		return message.channel.send(`🚫 ${type === 'client' ? 'I\'m' : 'You are'} missing these permissions **${missing.join(',')}** to do ${command.id}`);
	}
}

module.exports = MissingPermissionsListner;
