import { ConnectionManager } from 'typeorm';
import { Setting } from '../models/Settings';
import { Tag } from '../models/Tags';
// TODO: add these in future
// import { RoleState } from '../models/RoleStates';
// import { Case } from '../models/Cases';
import { Reminder } from '../models/Reminders';

const connectionManager = new ConnectionManager();
connectionManager.create({
	name: 'kitso',
	type: 'postgres',
	url: process.env.DATABASE_URL,
	entities: [Setting, Tag, Reminder]
});

export default connectionManager;
