const { Listener } = require('discord-akairo');

class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		});
	}

	exec() {
		this.client.logger.info(`Ready, Slave ${this.client.user.tag} is ready to do her job`);
		this.client.user.setActivity(`@${this.client.user.username} help 💖`);
	}
}
module.exports = ReadyListener;
