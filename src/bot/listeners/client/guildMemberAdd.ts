import { Listener } from 'discord-akairo';
import { GuildMember, TextChannel } from 'discord.js';
import { Case } from '../../models/Cases';

export default class GuildMemberAddListener extends Listener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client'
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		const caseRepo = this.client.db.getRepository(Case);
		const user = await caseRepo.findOne({ action: 5, target_id: member.id, action_processed: false });
		if (user) (this.client.channels.get('559070713181372446') as TextChannel).send(`• Watch Dog: ${user.target_tag} had left and join again to delete the mute role of him.`);
	}
}
