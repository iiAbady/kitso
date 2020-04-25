import { Argument, Command } from 'discord-akairo';
import { Message, GuildMember, TextChannel, User } from 'discord.js';
import { stripIndents } from 'common-tags';
import Util from '../../util';
import { Case } from '../../models/Cases';

export default class BanCommand extends Command {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'mod',
			description: {
				content: 'Hammer on the edgy boys.',
				usage: '<member> <...reason> [--days/-d]',
				examples: ['@Abady', 'Abady said really bad things --days:5'],
			},
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: Argument.union(
						'member',
						async (_, phrase): Promise<{ id: string; user: User } | null> => {
							if (!phrase) return null;
							const m = await this.client.users.fetch(phrase);
							if (m) return { id: m.id, user: m };
							return null;
						},
					),
					prompt: {
						start: (message: Message): string => `${message.author}, what member do you want to ban?`,
						retry: (message: Message): string => `${message.author}, please mention a member.`,
					},
				},
				{
					id: 'days',
					type: 'integer',
					match: 'option',
					flag: ['--days=', '-d='],
					default: 0,
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: '',
				},
			],
		});
	}

	public async exec(
		message: Message,
		{ member, days, reason }: { member: GuildMember; days: number; reason: string },
	): Promise<Message | Message[] | void> {
		if (member.hasPermission('MANAGE_GUILD')) return;
		if (member.id === message.author!.id) {
			return message.reply('REALLLLLLLLLY?');
		}
		const key = `${message.guild!.id}:${member.id}:BAN`;
		if (this.client.cachedCases.has(key)) {
			return message.reply('User is getting the law by someone else.');
		}
		this.client.cachedCases.add(key);

		const casesRepo = this.client.db.getRepository(Case);
		const dbCases = await casesRepo.find({ target_id: member.id });
		const embed = Util.historyEmbed(member, dbCases);
		await message.channel.send('You sure you want me to ban this dude? (yes/anything)', { embed });
		const responses = await message.channel.awaitMessages((msg): boolean => msg.author.id === message.author!.id, {
			max: 1,
			time: 10000,
		});

		if (!responses || responses.size !== 1) {
			this.client.cachedCases.delete(key);
			return message.reply(':x: timed out. Cancelled ban.');
		}
		const response = responses.first();

		let sentMessage;
		if (/^y(?:e(?:a|s)?)?$/i.test(response!.content)) {
			sentMessage = await message.channel.send(`Banning **${member.user.tag}**...`);
		} else {
			this.client.cachedCases.delete(key);
			return message.reply(':x: cancelled ban.');
		}

		const totalCases = (this.client.settings.get(message.guild!, 'caseTotal', 0) as number) + 1;

		try {
			try {
				await member.send(stripIndents`
					**You have been banned from ${message.guild!.name}**
					${reason ? `\n**Reason:** ${reason}\n` : ''}
					Want to appeal? DM البيماني#6399 or xRokz#0555
				`);
			} catch {}
			await member.ban({ days, reason: `Banned by ${message.author!.tag} | Case #${totalCases}` });
		} catch {
			try {
				await message.guild!.members.ban(member.id, {
					days,
					reason: `Banned by ${message.author!.tag} | Case #${totalCases}`,
				});
			} catch (error) {
				this.client.cachedCases.delete(key);
				return message.reply(`Error occur while baning this member: \`${error}\``);
			}
		}

		this.client.settings.set(message.guild!, 'caseTotal', totalCases);

		if (!reason) {
			// @ts-ignore
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = process.env.MOD_CHANNEL;
		let modMessage;
		if (modLogChannel) {
			const e = Util.logEmbed({ message, member, action: 'Ban', caseNum: totalCases, reason }).setColor(
				Util.CONSTANTS.COLORS.BAN,
			);
			modMessage = await (this.client.channels.get(modLogChannel) as TextChannel).send(e);
		}

		const dbCase = new Case();
		dbCase.guild = message.guild!.id;
		if (modMessage) dbCase.message = modMessage.id;
		dbCase.case_id = totalCases;
		dbCase.target_id = member.id;
		dbCase.target_tag = member.user.tag;
		dbCase.mod_id = message.author!.id;
		dbCase.mod_tag = message.author!.tag;
		dbCase.action = Util.CONSTANTS.ACTIONS.BAN;
		dbCase.reason = reason;
		await casesRepo.save(dbCase);

		return sentMessage.edit(`Successfully banned **${member.user.tag}**`);
	}
}
