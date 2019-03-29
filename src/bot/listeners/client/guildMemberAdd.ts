import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Case } from '../../models/Cases';

export default class GuildMemberAddListener extends Listener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client'
		});
	}

	public async exec(member: GuildMember) {
			const caseRepo = this.client.db.getRepository(Case);
			const muteRole = '535147827358203916';
			const user = await caseRepo.findOne({ action: 5, target_id: member.id });
			if (user) this.client.logger.info(user);
			// try {
			// 	if (user) await member.roles.add(muteRole, '• Automatic Mute Role Watchdog •');
			// } catch {} // tslint:disable-line
	}
}
