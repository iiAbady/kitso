const { Listener } = require('discord-akairo');

class Cooldown extends Listener {
	constructor() {
		super('cooldown', {
			emitter: 'commandHandler',
			event: 'cooldown',
			category: 'commandHandler'
		});
	}

	msToSeconds(ms) {
		const seconds = ((ms % 60000) / 1000).toFixed(0);
		return seconds;
	}

	exec(message, command, ms) {
		message.channel.send(`:hourglass_flowing_sand: Wait **\`\`${this.msToSeconds(ms)}s\`\`** before using **${command.id}**!`);
	}
}
module.exports = Cooldown;
