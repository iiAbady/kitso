const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
const { staff, tokens } = require('./bot');
const { createLogger, transports, format } = require('winston');
const { join } = require('path');
const database = require('./database');
const SettingsProvider = require('./SettingsProvider');

class KitsoClient extends AkairoClient {
	constructor() {
		super({
			ownerID: staff
		}, {
			disableEveryone: true
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
			defaultCooldown: 3000,
			aliasReplacement: /-/g,
			prefix: message => this.settings.get(message.guild.id, 'prefix', 'a@'),
			blockBots: true
		});
		this.listenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });
	}

	init() {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler
		});
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
	}

	async start() {
		await this.settings.init().then(this.logger.info(`[DATABASE] Connecting to database`)).catch(err => this.logger.error(`[DATABASE] An error occur while connecting ${err}`))
			.then(this.logger.info(`[DATABASE] Connected!`));
		await this.init();
		return this.login(tokens.bot);
	}
}
module.exports = KitsoClient;
