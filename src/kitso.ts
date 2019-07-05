import 'reflect-metadata';
import KitsoClient from './bot/client/KitsoClient';
import { Logger } from 'winston';
// import './env';
// TODO: make this like the old way: process.env.OWNERS only
const client = new KitsoClient({ owner: ['171259176029257728', '298732816995319809', '323231064157847559'], token: process.env.TOKEN });

client
	.on('error', (err): Logger => client.logger.error(`[CLIENT ERROR] ${err.message}`, err.stack))
	.on('warn', (warn): Logger => client.logger.warn(`[CLIENT WARN] ${warn}`));

client.start();
