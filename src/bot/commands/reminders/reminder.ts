import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class ReminderCommand extends Command {
	public constructor() {
		super('reminder', {
			aliases: ['remind', 'reminder'],
			ownerOnly: true,
			description: {
				content: stripIndents`Available methods:
					 • add \`[--hoist/--pin] <tag> <content>\`
					 • del \`[--all]\`
					Required: \`<>\` | Optional: \`[]\`
					For additional \`<...arguments>\` usage refer to the examples below.
				`,
				usage: '<method> <...arguments>',
				examples: [
					'add leave in 5 minutes',
					'add --dm ban Dim in 6 months',
					'delete',
					'delete --all'
				]
			},
			category: 'reminders',
			ratelimit: 2,
			args: [
				{
					id: 'method',
					type: ['add', 'del', 'delete']
				},
				{
					'id': 'name',
					'match': 'rest',
					'default': ''
				}
			]
		});
	}

	public async exec(message: Message, { method, name }: { method: string; name: string }): Promise<Message | Message[] | boolean | null> {
		if (!method) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			return message.util!.send(stripIndents`
			I-I don't understand what are you saying senpai!
			Check \`${prefix}help remind\` for more information.
			`);
		}
		// eslint-disable-next-line
		const command = ({
			'add': this.handler.modules.get('reminder-add'),
			'cancel': this.handler.modules.get('reminder-delete'),
			'del': this.handler.modules.get('reminder-delete'),
			'delete': this.handler.modules.get('reminder-delete')
		} as { [key: string]: Command })[method];

		return this.handler.handleDirectCommand(message, name, command, true);
	}
}
