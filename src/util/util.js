exports.cleanContent = (str, message) => str
	.replace(/@(everyone|here)/g, '@\u200b$1')
	.replace(/<@!?[0-9]+>/g, input => {
		const id = input.replace(/<|!|>|@/g, '');
		if (message.channel.type === 'dm' || message.channel.type === 'group') {
			const user = message.client.users.get(id);
			return user ? `@${user.username}` : input;
		}

		const member = message.channel.guild.members.get(id);
		if (member) {
			return `@${member.displayName}`;
		}
		const user = message.client.users.get(id);
		return user ? `@${user.username}` : input;
	})
	.replace(/<#[0-9]+>/g, input => {
		const channel = message.client.channels.get(input.replace(/<|#|>/g, ''));
		return channel ? `#${channel.name}` : input;
	})
	.replace(/<@&[0-9]+>/g, input => {
		if (message.channel.type === 'dm' || message.channel.type === 'group') return input;
		const role = message.guild.roles.get(input.replace(/<|@|>|&/g, ''));
		return role ? `@${role.name}` : input;
	});

exports.splitMessage = (text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) => {
	if (text.length <= maxLength) return text;
	const splitText = text.split(char);
	if (splitText.some(chunk => chunk.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
	const messages = [];
	let msg = '';
	for (const chunk of splitText) {
		if (msg && (msg + char + chunk + append).length > maxLength) {
			messages.push(msg + append);
			msg = prepend;
		}
		msg += (msg && msg !== prepend ? char : '') + chunk;
	}
	return messages.concat(msg).filter(m => m);
};

