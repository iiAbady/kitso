import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Reminder } from '../../models/Reminders';
import { emojis } from '../../util';
const ms = require('@naval-base/ms'); // tslint:disable-line

const REMINDER_LIMIT = 3;

export default class ReminderAddCommand extends Command {
	public constructor() {
		super('reminder-add', {
			aliases: ['remind-me'],
			category: 'reminders',
			description: {
				content: 'Adds a reminder that triggers at the given time and tells you the given reason.',
				usage: '[--dm/--pm] <reason> <time>',
				examples: ['eat in 5 minutes', 'play minecraft in 6 months --dm']
			},
			ratelimit: 2,
			args: [
				{
					id: 'time',
					type: str => {
						if (!str) return null;
						const duration = ms(str);
						if (duration && duration >= 300000 && !isNaN(duration)) return duration;
						return null;
					},
					prompt: {
						start: (message: Message) => `${message.author}, When do you want me to remind you?`,
						retry: (message: Message) => `${message.author}, Please use proper time format, time should be 5 mineuts or more!`
					}
				},
				{
					id: 'reason',
					type: 'string',
					prompt: {
						start: (message: Message) => `${message.author}, What do you want me to remind you of?`
					}
				},
				{
					id: 'dm',
					match: 'flag',
					flag: ['--dm', '--pm']
				}
			]
		});
	}

	public async exec(message: Message, { time, reason, dm }: { time: number, reason: string, dm: boolean }) {
		const remindersRepo = this.client.db.getRepository(Reminder);
		const reminderCount = await remindersRepo.count({ user: message.author.id });
		if (reminderCount > REMINDER_LIMIT) {
			return message.util!.reply(`you have ${REMINDER_LIMIT} reminders already! I can't do more ~_~`);
		}

		if (reason && reason.length >= 1850) {
			return message.util!.reply('Reminders reasons contents have a limit of **1950** characters only!');
		}
		if (!time) {
			return message.util!.reply('I can\'t tell what time I\'m supposed to remind you at!');
		}
		if ((Date.now() + time) < Date.now()) {
			return message.util!.reply('sorry, I don\'t have access to time travel yet!');
		}
		if ((Date.now() + time) < (Date.now() + 5000)) {
			return message.util!.reply('I\'m sure you have better memory than that.');
		}

		await this.client.remindScheduler.addReminder({
			user: message.author.id,
			// @ts-ignore
			channel: message.channel.type === 'dm' || dm ? null : message.channel.id,
			reason,
			trigger: message.url,
			// @ts-ignore
			triggers_at: Date.now() + time
		});

		return message.util!.reply(`${emojis.thumbsoUpo} I'll remind you in ${ms(time)}`);
	}
}
