const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');

class HelpCommand extends Command {
	constructor() {
		super('help', {
			aliases: ['help'],
			cooldown: 5000,
			ratelimit: 1,
			category: 'info',
			channelRestriction: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Shows the bot help list.'
			},
			args: [
				{
					id: 'command',
					type: cmd => {
						if (!cmd) return ' ';
						const command = this.handler.findCommand(cmd);
						if (!command) return cmd;
						return command;
					}
				}
			]
		});
	}

	exec(message, { command }) {
		const prefix = this.handler.prefix(message);
		if (command === ' ') {
			const embed = new RichEmbed()
				.setColor(3447003)
				.setAuthor(`${this.client.user.username} Help`, this.client.user.avatarURL)
				.setDescription(`Commands List. For additional info on a command, type **\`${prefix}help <command>\`**\n**[Need more help? (Support Server)](https://discord.gg/UkYbHU2)**`);
			for (const category of this.handler.categories.filter(m => m.id !== 'default').values()) {
				embed.addField(`❯ ${category.id.replace(/(\b\w)/gi, lc => lc.toUpperCase())}`, `${category.filter(cmd => cmd.aliases.length).map(cmd => `\`${cmd.aliases[0]}\``).join(' ')}`);
			}
			return message.channel.send(embed);
		}
		if (!command.aliases) return message.channel.send(`:x: No command with this name **\`\`${command}\`\`** found.`);
		const embed = new RichEmbed()
			.setColor(3447003)
			.setAuthor(`${command.aliases[0].replace(/(\b\w)/gi, lc => lc.toUpperCase())} Help`, 'https://images-ext-2.discordapp.net/external/Na1A42IsnllvKah5w2E8qEoTX5VMgkiFd6Y18oy7-Ws/%3Fwidth%3D473%26height%3D473/https/images-ext-2.discordapp.net/external/ixx9VwaXIvBi71wGahYe_NzG51gFQonnXVBl2eEbQmk/https/cdn.pixabay.com/photo/2012/04/14/16/26/question-34499_960_720.png')
			.addField('❯ Description', command.description.content || '\u200b');

		if (command.aliases.length > 1) embed.addField('❯ Aliases', `\`${command.aliases.join('` `')}\``, true);
		if (command.description.examples && command.description.examples.length) embed.addField('❯ Examples', `\`${command.aliases[0]} ${command.description.examples.join(`\`\n\`${command.aliases[0]} `)}\``, true);
		if (command.description.usage) embed.addField('❯ Usage', `\`${prefix}${command.aliases[0]} ${command.description.usage}\``, true);

		return message.channel.send(embed);
	}
}

module.exports = HelpCommand;
