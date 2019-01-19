const { Command, Control } = require('discord-akairo');
const { Util } = require('discord.js');

class TagEditCommand extends Command {
	constructor() {
		super('tag-edit', {
			category: 'tags',
			description: {
				content: 'Edit a tag (Markdown can be used).',
				usage: '<tag> [--hoist/--unhoist/--pin/--unpin] <content>',
				examples: ['Test Some new content', '"Test 1" Some more new content', 'Test --hoist', '"Test 1" --unpin']
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'tag',
					type: 'tag',
					prompt: {
						start: message => `${message.author}, what tag do you want to edit?`,
						retry: (message, _, provided) => `${message.author}, a tag with the name **${provided.phrase}** does not exist.`
					}
				},
				{
					id: 'hoist',
					match: 'flag',
					flag: ['--hoist', '--pin']
				},
				{
					id: 'unhoist',
					match: 'flag',
					flag: ['--unhoist', '--unpin']
				},
				Control.if((_, args) => args.hoist || args.unhoist, [
					{
						id: 'content',
						match: 'rest',
						type: 'tagContent'
					}
				], [
					{
						id: 'content',
						match: 'rest',
						type: 'tagContent',
						prompt: {
							start: message => `${message.author}, what should the new content be?`
						}
					}
				])
			]
		});
	}

	async exec(message, { tag, hoist, unhoist, content }) {
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild.id, 'modRole')) || message.member.hasPermission('MANAGE_GUILD');
		if (tag.user !== message.author.id && !staffRole) {
			return message.reply('Losers are only allowed to edit their own tags! Hah hah hah!');
		}
		if (content && content.length >= 1950) {
			return message.reply('you must still have water behind your ears to not realize that messages have a limit of 2000 characters!');
		}
		if (hoist) hoist = true;
		else if (unhoist) hoist = false;
		if (staffRole) tag.hoisted = hoist;
		if (content) {
			content = Util.cleanContent(content, message);
			tag.content = content;
		}
		tag.last_modified = message.author.id; // eslint-disable-line camelcase
		await tag.save();

		return message.reply(`successfully edited **${tag.name}**${hoist && staffRole ? ' to be hoisted.' : '.'}`);
	}
}

module.exports = TagEditCommand;
