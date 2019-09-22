import { join } from 'path';
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler, Flag } from 'discord-akairo';
import { Collection, Message, Webhook } from 'discord.js';
import { Logger, createLogger, transports, format } from 'winston';
import database from '../structures/Database';
import TypeORMProvider from '../structures/SettingsProvider';
import MuteScheduler from '../structures/MuteScheduler';
import RemindScheduler from '../structures/RemindScheduler';
import { Setting } from '../models/Settings';
import { Connection, Raw } from 'typeorm';
import { Case } from '../models/Cases';
import { Reminder } from '../models/Reminders';
import { Tag } from '../models/Tags';
import { init } from '@sentry/node';
const { version } = require('../../../package'); // eslint-disable-line

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		db: Connection;
		settings: TypeORMProvider;
		commandHandler: CommandHandler;
		config: KitsoOptions;
		webhooks: Collection<string, Webhook>;
		cachedCases: Set<string>;
		muteScheduler: MuteScheduler;
		remindScheduler: RemindScheduler;
	}
}

interface KitsoOptions {
	owner?: string | string[] | undefined;
	token?: string;
}

export default class KitsoClient extends AkairoClient {
	public logger = createLogger({
		format: format.combine(
			format.colorize({ level: true }),
			format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
			format.printf((info: any): string => {
				const { timestamp, level, message, ...rest } = info;
				return `[${timestamp}] ${level}: ${message}${
					Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''
				}`;
			}),
		),
		transports: [new transports.Console({ level: 'info' })],
	});

	public db!: Connection;

	public settings!: TypeORMProvider;

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: (message: Message): string => this.settings.get(message.guild, 'prefix', '?'),
		aliasReplacement: /-/g,
		allowMention: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 3000,
		argumentDefaults: {
			prompt: {
				modifyStart: (_: Message, str: string): string => `${str}\n\nType \`cancel\` to cancel the command.`,
				modifyRetry: (_: Message, str: string): string => `${str}\n\nType \`cancel\` to cancel the command.`,
				timeout: ':x: You took too long! **cancelled**',
				ended: ":x: You've used your 3/3 tries! **cancelled**",
				cancel: ':x: Cancelled',
				retries: 3,
				time: 30000,
			},
			otherwise: '',
		},
	});

	public inhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });

	public listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

	public config: KitsoOptions;

	public cachedCases: Set<string> = new Set();

	public muteScheduler!: MuteScheduler;

	public remindScheduler!: RemindScheduler;

	public constructor(config: KitsoOptions) {
		super(
			{ ownerID: config.owner },
			{
				messageCacheMaxSize: 1000,
				disableEveryone: true,
				disabledEvents: ['TYPING_START'],
			},
		);

		this.commandHandler.resolver.addType(
			'tag',
			async (message, phrase): Promise<any> => {
				if (!phrase) return Flag.fail(phrase);
				const tagsRepo = this.db.getRepository(Tag);
				const tag = await tagsRepo.findOne({
					where: [
						{ name: phrase, guild: message.guild.id },
						{ aliases: Raw(alias => `${alias} @> ARRAY['${phrase}']::varchar[]`), guild: message.guild.id },
					],
				});

				return tag || Flag.fail(phrase);
			},
		);

		this.commandHandler.resolver.addType(
			'existingTag',
			async (message, phrase): Promise<any> => {
				if (!phrase) return Flag.fail(phrase);
				const tagsRepo = this.db.getRepository(Tag);
				const tag = await tagsRepo.findOne({
					where: [
						{ name: phrase, guild: message.guild.id },
						{ aliases: Raw(alias => `${alias} @> ARRAY['${phrase}']::varchar[]`), guild: message.guild.id },
					],
				});

				return tag ? Flag.fail(phrase) : phrase;
			},
		);
		this.commandHandler.resolver.addType(
			'tagContent',
			async (message, phrase): Promise<any> => {
				if (!phrase) phrase = '';
				if (message.attachments.first()) phrase += `\n${message.attachments.first()!.url}`;

				return phrase || Flag.fail(phrase);
			},
		);

		this.config = config;

		if (process.env.SENTRY) {
			init({
				dsn: process.env.SENTRY,
				environment: process.env.NODE_ENV,
				release: version,
			});
		} else {
			process.on(
				'unhandledRejection',
				(err: any): Logger => this.logger.error(`[UNHANDLED REJECTION] ${err.message}`, err.stack),
			);
		}

		if (process.env.LOGS) {
			this.webhooks = new Collection();
		}
	}

	private async _init(): Promise<void> {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
		});

		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();

		this.db = database.get('kitso');
		await this.db.connect();
		if (process.env.NODE_ENV !== 'production') await this.db.synchronize();
		this.settings = new TypeORMProvider(this.db.getRepository(Setting));
		await this.settings.init();
		this.muteScheduler = new MuteScheduler(this, this.db.getRepository(Case));
		this.remindScheduler = new RemindScheduler(this, this.db.getRepository(Reminder));
		await this.muteScheduler.init();
		await this.remindScheduler.init();
	}

	public async start(): Promise<string> {
		await this._init();
		return this.login(this.config.token);
	}
}
