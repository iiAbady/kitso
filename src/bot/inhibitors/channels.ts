// import { Inhibitor } from 'discord-akairo';
// import { Message } from 'discord.js';

// export default class ChannelsInhibitor extends Inhibitor {
// 	public constructor() {
// 		super('channels', {
// 			type: 'pre',
// 			reason: 'channels'
// 		});
// 	}

// 	public exec(message: Message) {
// 		const channels: string[] = ['530861985475067904', '541659893598257153', '530861692242886666', '535134226765578241', '466684423438336025'];
// 		return !channels.includes(message.channel.id);
// 	}
// }
