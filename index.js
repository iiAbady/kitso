const KitsoClient = require('./src/structures/client');
const client = new KitsoClient({ owner: process.env.OWNERS, token: process.env.TOKEN });

client
	.on('error', err => client.logger.error(`[Client Error]\n${err.stack}`))
	.on('warn', warn => client.logger.warn(`[Client Warning]\n${warn}`));

client.start();
