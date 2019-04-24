import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class MissingPermissions extends Listener {
	public constructor() {
		super('missingPermissions', {
			event: 'missingPermissions',
			emitter: 'commandHandler',
			category: 'commandHandler'
		});
	}

	public async exec(message: Message, command: Command, reason: string): Promise<Message | Message[]> {
		return message.channel.send(`:x: ${reason === 'clientPermissions' ? 'I' : 'You'} don't have permissions to do ${command.aliases[0]}!`);
	}
}
