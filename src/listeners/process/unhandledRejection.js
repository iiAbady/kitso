const { Listener } = require('discord-akairo');
class unhandledRejection extends Listener {
	constructor() {
		super('unhandledRejection', {
			emitter: 'process',
			event: 'unhandledRejection',
			category: 'process'
		});
	}

	exec(reason) {
		this.client.logger.warn(`[Unhandled Rejection] ${reason}`);
	}
}
module.exports = unhandledRejection;
