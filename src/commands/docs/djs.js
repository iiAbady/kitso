const { Command } = require('discord-akairo');
const fetch = require('node-fetch');
const qs = require('querystring');

class DocsCommand extends Command {
	constructor() {
		super('djs', {
			aliases: ['djs'],
			description: {
				content: 'Searches discord.js docs.',
				usage: '<query>',
				examples: ['TextChannel commando', 'Client', 'ClientUser#setActivity master']
			},
			category: 'docs',
			clientPermissions: ['EMBED_LINKS'],
			regex: /^(?:djs,) (.+)/i,
			ratelimit: 2,
			args: [
				{
					id: 'query',
					match: 'rest',
					type: 'lowercase',
					prompt: {
						start: message => `${message.author}, What would you like to search in discord.js?`
					}
				},
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '-f']
				}
			]
		});
	}

	async exec(message, { query, force }) {
		query = query.split(' ');
		let project = 'main';
		let branch = ['stable', 'master', 'rpc', 'commando'].includes(query.slice(-1)[0]) ? query.pop() : 'stable';
		if (['rpc', 'commando'].includes(branch)) {
			project = branch;
			branch = 'master';
		}
		const queryString = qs.stringify({ q: query.join(' '), force });
		const res = await fetch(`https://djsdocs.sorta.moe/${project}/${branch}/embed?${queryString}`);
		const embed = await res.json();
		if (!embed) {
			return message.reply("Kitso couldn't find the requested information!");
		}
		if (message.channel.type === 'dm' || !message.channel.permissionsFor(message.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.channel.send({ embed });
		}
		const msg = await message.util.send({ embed });
		msg.react('🗑');
		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 5000, errors: ['time'] }
			);
		} catch (error) {
			msg.reactions.removeAll();

			return message;
		}
		react.first().message.delete();

		return message;
	}
}

module.exports = DocsCommand;
