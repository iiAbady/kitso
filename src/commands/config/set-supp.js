const { Command } = require('discord-akairo');

class SetModRoleCommand extends Command {
	constructor() {
		super('set-supp', {
			aliases: ['set-supp', 'supp-role', 'mod-role'],
			description: {
				content: 'Sets the support role',
				usage: '<role>',
				examples: ['modrole @Mod', 'modrole Mods']
			},
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'role',
					match: 'content',
					type: 'role'
				}
			]
		});
	}

	exec(message, { role }) {
		this.client.settings.set(message.guild, 'modRole', role.id);
		return message.reply(`set moderation role to **${role.name}**`);
	}
}

module.exports = SetModRoleCommand;
