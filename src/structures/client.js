const { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } = require('discord-akairo');
const { staff, tokens } = require('./bot');
const { createLogger, transports, format } = require('winston');
const { join } = require('path');
const { cleanContent } = require('../util/util');
const { Op } = require('sequelize');
const database = require('./database');
const SettingsProvider = require('./SettingsProvider');

class KitsoClient extends AkairoClient {
	constructor() {
		super({
			ownerID: staff
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
			phrase = cleanContent(phrase.toLowerCase(), message);
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
			phrase = cleanContent(phrase.toLowerCase(), message);
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
			phrase = cleanContent(phrase, message);
			if (message.attachments.first()) phrase += `\n${message.attachments.first().url}`;

			return phrase || null;
		});

		this.listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });
		this.InhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });
	}

	init() {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			InhibitorHandler: this.InhibitorHandler
		});
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
		this.InhibitorHandler.loadAll();
	}

	async start() {
		await this.db.sync();
		await this.settings.init().then(this.logger.info(`[DATABASE] Connecting to database`)).catch(err => this.logger.error(`[DATABASE] An error occur while connecting ${err}`))
			.then(this.logger.info(`[DATABASE] Connected!`));
		await this.init();
		return this.login(tokens.bot);
	}
}
module.exports = KitsoClient;
