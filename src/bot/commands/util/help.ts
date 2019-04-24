import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class HelpCommand extends Command {
	public constructor() {
		super('help', {
			aliases: ['help'],
			description: {
				content: 'Displays a list of available commands, or detailed information for a specified command.',
				usage: '[command]'
			},
			category: 'util',
			clientPermissions: ['EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'command',
					type: (_, cmd): Command | string => {
						if (!cmd) return '';
						const commandAlias = this.handler.modules.filter((modulex): boolean => !modulex.ownerOnly).find((commando): boolean => commando.aliases.includes(cmd));
						return commandAlias || cmd;
					}
				}
			]
		});
	}

	public async exec(message: Message, { command }: { command: Command }): Promise<Message | Message[]> {
		// @ts-ignore
		const prefix = this.handler.prefix(message);
		if (!command) {
			const embed = new MessageEmbed()
				.setColor(3447003)
				.addField('❯ Commands', stripIndents`A list of available commands.
					For additional info on a command, type \`${prefix}help <command>\`
				`);

			for (const category of this.handler.categories.values()) {
				embed.addField(`❯ ${category.id.replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())}`, `${category.filter((cmd): boolean => cmd.aliases.length > 0).map((cmd): string => `\`${cmd.aliases[0]}\``).join(' ')}`);
			}

			return message.util!.send(embed);
		}
		if (!command.aliases) return message.channel.send(`:x: No command with this name **\`\`${command}\`\`** found.`);
		const embed = new MessageEmbed()
			.setColor(3447003)
			.setAuthor(`${command.aliases[0].replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())} Help`, 'https://images-ext-2.discordapp.net/external/Na1A42IsnllvKah5w2E8qEoTX5VMgkiFd6Y18oy7-Ws/%3Fwidth%3D473%26height%3D473/https/images-ext-2.discordapp.net/external/ixx9VwaXIvBi71wGahYe_NzG51gFQonnXVBl2eEbQmk/https/cdn.pixabay.com/photo/2012/04/14/16/26/question-34499_960_720.png')
			.addField('❯ Description', command.description.content || '\u200b');

		if (command.aliases.length > 1) embed.addField('❯ Aliases', `\`${command.aliases.join('` `')}\``, true);
		if (command.description.examples && command.description.examples.length) embed.addField('❯ Examples', `\`${command.aliases[0]} ${command.description.examples.join(`\`\n\`${command.aliases[0]} `)}\``, true);
		if (command.description.usage) embed.addField('❯ Usage', `\`${prefix}${command.aliases[0]} ${command.description.usage}\``, true);

		return message.util!.send(embed);
	}
}
