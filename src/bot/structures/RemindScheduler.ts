import KitsoClient from '../client/KitsoClient';
import { TextChannel } from 'discord.js';
import { Repository, LessThan } from 'typeorm';
import { Reminder } from '../models/Reminders';

export default class RemindScheduler {
	protected client: KitsoClient;

	protected repo: Repository<any>;

	protected checkRate: number;

	protected checkInterval!: NodeJS.Timeout;

	protected queuedSchedules = new Map();

	public constructor(client: KitsoClient, repository: Repository<any>, { checkRate = 5 * 60 * 1000 } = {}) {
		this.client = client;
		this.repo = repository;
		this.checkRate = checkRate;
	}

	public async addReminder(reminder: Reminder): Promise<void> {
		const remindersRepo = this.client.db.getRepository(Reminder);
		const rmd = new Reminder();
		rmd.user = reminder.user;
		if (reminder.channel) rmd.channel = reminder.channel;
		rmd.reason = reminder.reason;
		rmd.trigger = reminder.trigger;
		rmd.triggers_at = new Date(reminder.triggers_at);
		const dbReminder = await remindersRepo.save(rmd);
		if (dbReminder.triggers_at.getTime() < Date.now() + this.checkRate) {
			this.queueReminder(dbReminder);
		}
	}

	public cancelReminder(id: string): boolean {
		const schedule = this.queuedSchedules.get(id);
		if (schedule) clearTimeout(schedule);
		return this.queuedSchedules.delete(id);
	}

	public async deleteReminder(reminder: Reminder): Promise<Reminder> {
		const schedule = this.queuedSchedules.get(reminder.id);
		if (schedule) clearTimeout(schedule);
		this.queuedSchedules.delete(reminder.id);
		const remindersRepo = this.client.db.getRepository(Reminder);
		const deleted = await remindersRepo.remove(reminder);
		return deleted;
	}

	public queueReminder(reminder: Reminder): void {
		this.queuedSchedules.set(
			reminder.id,
			setTimeout((): void => {
				this.runReminder(reminder);
			}, reminder.triggers_at.getTime() - Date.now()),
		);
	}

	public async runReminder(reminder: Reminder): Promise<void> {
		try {
			const reason = reminder.reason || `${reminder.channel ? 'y' : 'Y'}ou wanted me to remind you around this time!`;
			const content = `${reminder.channel ? `<@${reminder.user}>, ` : ''} ${reason}\n\n<${reminder.trigger}>`;
			const channel = reminder.channel && (this.client.channels.get(reminder.channel) as TextChannel);

			if (channel) {
				await channel.send(content);
			} else {
				const user = await this.client.users.fetch(reminder.user);
				await user.send(content);
			}
		} catch (error) {
			this.client.logger.error(`[REMINDER ERROR] ${error.message}`, error.stack);
		}

		try {
			await this.deleteReminder(reminder);
		} catch (error) {
			this.client.logger.error(`[REMINDER ERROR] ${error.message}`, error.stack);
		}
	}

	public async init(): Promise<void> {
		await this._check();
		this.checkInterval = setInterval(this._check.bind(this), this.checkRate);
	}

	private async _check(): Promise<void> {
		const remindersRepo = this.client.db.getRepository(Reminder);
		const reminders = await remindersRepo.find({ triggers_at: LessThan(new Date(Date.now() + this.checkRate)) });
		const now = new Date();

		for (const reminder of reminders) {
			if (this.queuedSchedules.has(reminder.id)) continue;

			if (reminder.triggers_at < now) {
				this.runReminder(reminder);
			} else {
				this.queueReminder(reminder);
			}
		}
	}
}
