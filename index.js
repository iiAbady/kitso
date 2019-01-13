const KitsoClient = require('./src/structures/client');
const client = new KitsoClient();

client
	.on('error', err => client.logger.error(`Error:\n${err.stack}`))
	.on('warn', warn => client.logger.warn(`Warning:\n${warn}`));
process
	.on('unhandledRejection', reason => client.logger.warn(`unhandled-rejection:\n${reason}`));

client.start();
