const { Listener } = require('discord-akairo');
const { channels, emojis } = require('../../structures/bot');
const { RichEmbed } = require('discord.js');
class ErrorListner extends Listener {
	constructor() {
		super('error', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commandHandler'
		});
	}

	exec(error, message, command) {
		if (command) {
            const errorMessage = error.message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''); //eslint-disable-line
			const id = command.id + errorMessage.length + command.id.length;
			this.client.logger.error(error);
			message.channel.send(`${emojis.error} **Oops, Unexpected Error!** The error was sent to our team and we'll try to fix it \`\`error: ${id}\`\``).then(() => {
				message.client.channels.get(channels.error).send(new RichEmbed()
					.setTitle(`**Error ${command.id.replace(/(\b\w)/gi, lc => lc.toUpperCase())}** \`\`${id}\`\``)
					.setDescription(`\`\`\`js\n${errorMessage}\`\`\``)
					.addField('Command', `id: ${command.id}\naliases: ${command.aliases}\ncategory: ${command.category}`, true)
					.addField('User', `id: ${message.author.id}\nusername: ${message.author.username}`, true)
					.addField('Guild', `id: ${message.guild.id}\nname: ${message.guild.name}`, true)
					.addField('Message', `id: ${message.id}\ncontent: ${message.content}`, true)
					.setTimestamp()
					.setFooter(id)
					.setThumbnail('https://cdn.iconscout.com/icon/premium/png-512-thumb/bug-314-763143.png')
					.setColor('RED'));
			});
		} else { this.client.logger.error(error); }
	}
}
module.exports = ErrorListner;
