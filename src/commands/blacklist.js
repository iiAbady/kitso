const { Command } = require('discord-akairo');

class BlacklistCommand extends Command {
	constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'unblacklist'],
			description: {
				content: 'Prohibit/Allow a user from using Kitso.',
				usage: '<user>',
				examples: ['Abady', '@Abady', '171259176029257728']
			},
			ownerOnly: true,
			ratelimit: 2,
			args: [
				{
					id: 'user',
					match: 'content',
					type: 'user',
					prompt: {
						start: message => `${message.author}, Who would you like to blacklist/unblacklist?`
					}
				}
			]
		});
	}

	exec(message, { user }) {
		const blacklist = this.client.settings.get('global', 'blacklist', []);
		if (blacklist.includes(user.id)) {
			const index = blacklist.indexOf(user.id);
			blacklist.splice(index, 1);
			if (blacklist.length === 0) this.client.settings.delete('global', 'blacklist');
			else this.client.settings.set('global', 'blacklist', blacklist);

			return message.util.send(`${user.tag}, have you realized Kitso's power? You've got good eyes~`);
		}

		blacklist.push(user.id);
		this.client.settings.set('global', 'blacklist', blacklist);

		return message.util.send(`${user.tag}, you are not worthy of Kitso's luck~`);
	}
}

module.exports = BlacklistCommand;
