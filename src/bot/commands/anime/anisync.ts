import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { User } from '../../models/Users';
import { emojis } from '../../util';
import fetch from 'node-fetch';
const AUTH_URL =
	'https://anilist.co/api/v2/oauth/authorize?client_id=2090&redirect_uri=https://anilist.co/api/v2/oauth/pin&response_type=code';

export default class ANISYNCCOMMAND extends Command {
	public constructor() {
		super('anisync', {
			aliases: ['anisync'],
			category: 'anime',
			description: {
				content: 'Sync your anilist account with kitso.',
			},
			clientPermissions: ['EMBED_LINKS'],
		});
	}

	public async exec(message: Message) {
		const usersRepo = this.client.db.getRepository(User);
		if (await usersRepo.findOne({ user: message.author!.id })) {
			return message.reply('You already synced.');
		}
		const embed = new MessageEmbed()
			.setDescription(`Please enter your [authentication code](${AUTH_URL})`)
			.setFooter('Waiting for auth code to be entered...');
		const msg = await message.util!.send({ embed });
		const responses = await message.channel.awaitMessages((Msg): boolean => Msg.author.id === message.author!.id, {
			max: 1,
			time: 30000,
		});

		if (!responses || responses.size !== 1) return message.reply(':x: timed out.');
		const authCode = responses.first()!.content;

		const res = await fetch('https://anilist.co/api/v2/oauth/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				grant_type: 'authorization_code',
				client_id: '2090',
				client_secret: 'PxJHVCQuLjO2iDm1RrEHKsajtnDhoNYkN3zcRbra',
				redirect_uri: 'https://anilist.co/api/v2/oauth/pin',
				code: authCode,
			}),
		});
		if (!res.ok) return message.reply('Wrong auth code.');
		const { access_token } = await res.json();
		const {
			data: {
				Viewer: { id, name },
			},
		}: { data: { Viewer: { id: string; name: string } } } = await (await fetch('https://graphql.anilist.co', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${access_token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				query: `{
                    Viewer {
						id,
						name
                    }
                }`,
			}),
		})).json();

		const user = new User();
		user.ani = id;
		user.user = message.author!.id;
		usersRepo.save(user);
		await message.delete({ reason: '• Auth Code •' });

		return msg.edit(`${emojis.thumbsup} Successfully synced your anilist account **${name}**.`, { embed: null });
	}
}
