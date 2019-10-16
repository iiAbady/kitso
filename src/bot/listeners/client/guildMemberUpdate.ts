import { Listener } from 'discord-akairo';
import { GuildMember, TextChannel } from 'discord.js';
import { Case } from '../../models/Cases';
import Util from '../../util';

export default class GuildMemberUpdateModerationListener extends Listener {
	public constructor() {
		super('guildMemberUpdateModeration', {
			emitter: 'client',
			event: 'guildMemberUpdate',
			category: 'client',
		});
	}

	public async exec(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
		const moderation = this.client.settings.get(newMember.guild, 'moderation', undefined);
		if (moderation) {
			if (this.client.cachedCases.delete(`${newMember.guild.id}:${newMember.id}:MUTE`)) return;
			const muteRole = '535147827358203916';
			if (!muteRole) return;
			if (oldMember.roles.has(muteRole) && newMember.roles.has(muteRole)) return;
			const modLogChannel = this.client.settings.get(newMember.guild, 'modLogChannel', undefined);
			const role = newMember.roles
				.filter((r): boolean => r.id !== newMember.guild.id && !oldMember.roles.has(r.id))
				.first();
			const casesRepo = this.client.db.getRepository(Case);
			if (!role) {
				if (oldMember.roles.has(muteRole) && !newMember.roles.has(muteRole)) {
					const dbCase = await casesRepo.findOne({ target_id: newMember.id, action_processed: false });
					if (dbCase) this.client.muteScheduler.cancelMute(dbCase);
				}
				return;
			}

			const actionName = 'Mute';
			const action: number = Util.CONSTANTS.ACTIONS.MUTE;
			const processed = false;

			const totalCases = (this.client.settings.get(newMember.guild, 'caseTotal', 0) as number) + 1;
			this.client.settings.set(newMember.guild, 'caseTotal', totalCases);

			let modMessage;
			if (modLogChannel) {
				// @ts-ignore
				const prefix = this.client.commandHandler.prefix({ guild: newMember.guild });
				const reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
				const color = Object.keys(Util.CONSTANTS.ACTIONS)
					.find((key): boolean => Util.CONSTANTS.ACTIONS[key] === action)!
					.split(' ')[0]
					.toUpperCase();
				const embed = Util.logEmbed({ member: newMember, action: actionName, caseNum: totalCases, reason }).setColor(
					Util.CONSTANTS.COLORS[color],
				);
				modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(embed);
			}
			const dbCase = new Case();
			dbCase.guild = newMember.guild.id;
			if (modMessage) dbCase.message = modMessage.id;
			dbCase.case_id = totalCases;
			dbCase.target_id = newMember.id;
			dbCase.target_tag = newMember.user.tag;
			dbCase.action = action;
			dbCase.action_processed = processed;
			await casesRepo.save(dbCase);
		}
	}
}
