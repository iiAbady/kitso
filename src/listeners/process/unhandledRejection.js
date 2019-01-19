const { Listener } = require('discord-akairo');

class UnhandledRejectionListener extends Listener {
	constructor() {
		super('unhandledRejection', {
			event: 'unhandledRejection',
			emitter: 'process',
			category: 'process'
		});
	}

	exec(error) {
		this.client.logger.warn(`[Unhandled Rejection] ${error}`);
	}
}

module.exports = UnhandledRejectionListener;
