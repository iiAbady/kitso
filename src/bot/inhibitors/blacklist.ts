import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class BlacklistInhibitor extends Inhibitor {
	public constructor() {
		super('blacklist', {
			type: 'all',
			reason: 'blacklist',
		});
	}

	public exec(message: Message): boolean {
		const blacklist = this.client.settings.get('global', 'blacklist', []);
		return blacklist.includes(message.author!.id);
	}
}
