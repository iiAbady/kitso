import 'reflect-metadata';
import KitsoClient from './bot/client/KitsoClient';
import { Logger } from 'winston';
import './env';
const client = new KitsoClient({ owner: process.env.OWNERS!.split(','), token: process.env.TOKEN });

client
	.on('error', (err): Logger => client.logger.error(`[CLIENT ERROR] ${err.message}`, err.stack))
	.on('warn', (warn): Logger => client.logger.warn(`[CLIENT WARN] ${warn}`));

client.start();
