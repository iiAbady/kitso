// ticket v0.1
const { Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');

class TicketCommand extends Command {
	constructor() {
		super('ticket', {
			aliases: ['ticket', 't'],
			cooldown: 5000,
			ratelimit: 3,
			category: 'util',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Ticekt System.',
				usage: 'help'
			},
			args: [
				{
					id: 'first'
				}
			]
		});
	}

	/**
	 *
	 * @param {import('discord.js').Message} message
	 */
	async exec(message, args) {
		const role = message.guild.roles.find(n => n.name.startsWith('Support Team'));
		const ticket = message.guild.channels.find(m => m.name === `ticket-${message.author.id}`);
		if (!role) return message.channel.send(`:x: First create a role that starts with \`\`Support Team\`\` then try this command again.`);
		if (args.first === 'help' || !args.first) {
			const prefix = this.handler.prefix(message);
			const embed = new MessageEmbed();
			embed.setTitle('🎫 Ticket System Help v0.1');
			embed.setDescription(`**${prefix}ticket new** - to start a new ticket!\n**${prefix}ticket close** - to close the current ticket`);
			embed.setColor('GREEN');
			return message.channel.send(embed);
		} else if (args.first === 'new') {
			if (ticket) return message.channel.send(`:x: You already have an existing ticket 🎫 ${ticket}`);
			await message.guild.channels.create(`ticket-${message.author.id}`, {
				type: 'text',
				permissionOverwrites: [{
					id: message.author.id,
					allow: ['READ_MESSAGES', 'SEND_MESSAGES', 'MANAGE_CHANNELS', 'ATTACH_FILES', 'EMBED_LINKS']
				}, {
					id: role,
					allow: ['READ_MESSAGES', 'SEND_MESSAGES', 'ATTACH_FILES']
				},
				{
					id: message.guild.id,
					deny: ['VIEW_CHANNEL', 'READ_MESSAGES']
				}],
				nsfw: false
			});
			message.channel.send(new MessageEmbed().setDescription(`:white_check_mark: Your ticket has been created ${message.guild.channels.find(m => m.name === `ticket-${message.author.id}`)}`).setColor('GREEN'));
			message.guild.channels.find(m => m.name === `ticket-${message.author.id}`).send(new MessageEmbed().setColor('GREEN').setDescription(`Dear ${message.author}\n\nThank you for reaching out to our ${role}!\nWe'll reply on you as fast as we can.`));
		} else if (args.first === 'close') {
			if (!ticket) return message.channel.send(`:x: You don't have an existing ticket. start a new one **\`\`${this.handler.prefix(message)}t new\`\`**`);
			if (message.channel.name !== ticket.name) return message.channel.send(`:x: Please only run this command in the ticket channel!`);
			await message.channel.send(`Are you sure you want to close this ticket?\nDo \`\`${this.handler.prefix(message)}t close\`\` to confirm.`);
			try {
				var response = await message.channel.awaitMessages(msg2 => (msg2.content === `--close` || msg2.content === 'cancel') && msg2.author.id === message.author.id, { maxMatches: 1, time: 20000, errors: ['time'] }); // eslint-disable-line no-var
			} catch (error) {
				return message.channel.send(`:X: Timeout`);
			}
			if (response.first().content === 'cancel') return message.channel.send(`Alirght, cancelled!`); //eslint-disable-line
			message.author.send(`🎫 You've closed your ticket in **${message.guild.name}**`);
			ticket.delete(`🎫 Ticket Closed by Ticket Starter`);
		}
	}
}
module.exports = TicketCommand;
