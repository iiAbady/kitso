const KitsoClient = require('./src/structures/client');
const client = new KitsoClient();

client
	.on('error', err => client.logger.error(`[Client Error]\n${err.stack}`))
	.on('warn', warn => client.logger.warn(`[Client Warning]\n${warn}`));
process
	.on('unhandledRejection', error => client.logger.error(`[Process Unhandled Rejection]\n${error}`));

client.start();
