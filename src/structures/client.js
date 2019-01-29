const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require('discord-akairo');
const { createLogger, transports, format } = require('winston');
const { join } = require('path');
const { library: { version } } = require('./bot');
const { Util } = require('discord.js');
const { Op } = require('sequelize');
const database = require('./database');
const SettingsProvider = require('./SettingsProvider');
const Raven = require('raven');

class KitsoClient extends AkairoClient {
	constructor(config) {
		super({
			ownerID: config.owner
		}, {
			messageCacheMaxSize: 1000,
			disableEveryone: true,
			disabledEvents: ['TYPING_START']
		});

		this.logger = createLogger({
			format: format.combine(
				format.colorize({ all: true }),
				format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
				format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
			),
			transports: [new transports.Console()]
		});

		this.db = database;
		this.settings = new SettingsProvider(database.model('settings'));

		this.commandHandler = new CommandHandler(this, {
			directory: join(__dirname, '..', 'commands'),
			allowMention: true,
			aliasReplacement: /-/g,
			prefix: message => this.settings.get(message.guild.id, 'prefix', 'a@'),
			blockBots: true,
			commandUtil: true,
			commandUtilLifetime: 5000,
			defaultCooldown: 3000,
			defaultPrompt: {
				modifyStart: str => `${str}\n\nType \`cancel\` to cancel the command.`,
				modifyRetry: str => `${str}\n\nType \`cancel\` to cancel the command.`,
				timeout: 'You took too long! timeout :x:',
				ended: 'You used 3/3 of your tries! cancelled :x:',
				cancel: 'Alright! cancelled :x:',
				retries: 3,
				time: 30000
			}
		});

		this.commandHandler.resolver.addType('tag', async (phrase, message) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			});

			return tag || null;
		});

		this.commandHandler.resolver.addType('existingTag', async (phrase, message) => {
			if (!phrase) return null;
			phrase = Util.cleanContent(phrase.toLowerCase(), message);
			const tag = await this.db.models.tags.findOne({
				where: {
					[Op.or]: [
						{ name: phrase },
						{ aliases: { [Op.contains]: [phrase] } }
					],
					guild: message.guild.id
				}
			});

			return tag ? null : phrase;
		});

		this.commandHandler.resolver.addType('tagContent', (phrase, message) => {
			if (!phrase) phrase = '';
			phrase = Util.cleanContent(phrase, message);
			if (message.attachments.first()) phrase += `\n${message.attachments.first().url}`;

			return phrase || null;
		});

		this.InhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });
		this.listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

		this.config = config;

		if (process.env.RAVEN) {
			Raven.config(process.env.RAVEN, {
				captureUnhandledRejections: true,
				autoBreadcrumbs: true,
				environment: process.env.NODE_ENV,
				release: version
			}).install();
		} else {
			process.on('unhandledRejection', err => this.logger.error(`[Unhandled Rejection] ${err.message}`, err.stack));
		}
	}

	async _init() {
		this.commandHandler.useInhibitorHandler(this.InhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			InhibitorHandler: this.InhibitorHandler,
			listenerHandler: this.listenerHandler
		});
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
		this.InhibitorHandler.loadAll();

		this.logger.info(`[DATABASE] Connecting to the database...`);
		await this.db.sync().then(this.logger.info(`[DATABASE] Connected!`)).catch(err => this.logger(`[DATABASE] Error while connecting ${err}`));
		await this.settings.init().catch(err => `[DATABASE: TABLE] ${err}`);
	}

	async start() {
		await this._init();
		return this.login(this.config.token);
	}
}
module.exports = KitsoClient;
