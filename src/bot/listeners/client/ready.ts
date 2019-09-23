import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client',
		});
	}

	public async exec(): Promise<void> {
		this.client.logger.info(
			`[READY] Yawn... Hmph, ${this.client.user!.tag} (${
				this.client.user!.id
			}) is only with you because she's in a good mood!`,
		);
		this.client.user!.setActivity(`🐟🐟🐟🐟`);
	}
}
