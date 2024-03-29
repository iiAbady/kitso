import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import * as moment from 'moment';
import 'moment-duration-format';

export default class NPMCommand extends Command {
	public constructor() {
		super('npm', {
			aliases: ['npm', 'npm-package'],
			category: 'docs',
			description: {
				content: 'Show details about a package! use --heroku or -h to have its implementation in package.json',
				usage: '<query>',
				examples: ['discord.js', 'discord-akairo', 'node-fetch -h'],
			},
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'pkg',
					prompt: {
						start: (message: Message): string => `${message.author}, what would you like to search for?`,
					},
					match: 'rest',
					type: (_, pkg): string | null => (pkg ? encodeURIComponent(pkg.replace(/ /g, '-')) : null),
				},
				{
					id: 'heroku',
					match: 'flag',
					flag: ['--heroku', '-h'],
				},
			],
		});
	}

	public async exec(message: Message, { pkg, heroku }: { pkg: string; heroku: boolean }): Promise<Message | Message[]> {
		const res = await fetch(`https://registry.npmjs.com/${pkg}`);
		if (res.status === 404) {
			return message.util!.reply("Kitso couldn't find the requested information.");
		}
		const body = await res.json();
		if (body.time.unpublished) {
			return message.util!.reply('The package is not unpublished yet.');
		}
		if (heroku) {
			return message.util!.send(`**"${pkg}":"^${body['dist-tags'].latest}**"`);
		}
		const version = body.versions[body['dist-tags'].latest];
		const maintainers = this._trimArray(body.maintainers.map((user: { name: string }): string => user.name));
		const dependencies = version.dependencies ? this._trimArray(Object.keys(version.dependencies)) : null;
		const embed = new MessageEmbed()
			.setColor(0xcb0000)
			.setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com/')
			.setTitle(body.name)
			.setURL(`https://www.npmjs.com/package/${pkg}`)
			.setDescription(body.description || 'No description.')
			.addField('❯ Version', body['dist-tags'].latest, true)
			.addField('❯ License', body.license || 'None', true)
			.addField('❯ Author', body.author ? body.author.name : '???', true)
			.addField('❯ Creation Date', moment.utc(body.time.created).format('YYYY/MM/DD hh:mm:ss'), true)
			.addField('❯ Modification Date', moment.utc(body.time.modified).format('YYYY/MM/DD hh:mm:ss'), true)
			.addField('❯ Main File', version.main || 'index.js', true)
			.addField('❯ Dependencies', dependencies && dependencies.length ? dependencies.join(', ') : 'None')
			.addField('❯ Maintainers', maintainers.join(', '));

		return message.util!.send(embed);
	}

	private _trimArray(arr: string[]): string[] {
		if (arr.length > 10) {
			const len = arr.length - 10;
			arr = arr.slice(0, 10);
			arr.push(`${len} more...`);
		}

		return arr;
	}
}
