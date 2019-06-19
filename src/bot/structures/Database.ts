import { ConnectionManager } from 'typeorm';
import { Setting } from '../models/Settings';
import { Tag } from '../models/Tags';
import { Case } from '../models/Cases';
import { Reminder } from '../models/Reminders';
import { User } from '../models/Users';
// import '../../env';

const connectionManager = new ConnectionManager();
connectionManager.create({
	name: 'kitso',
	type: 'postgres',
	url: process.env.DATABASE_URL,
	entities: [User]
});


export default connectionManager;
