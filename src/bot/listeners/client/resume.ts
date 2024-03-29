import { Listener } from 'discord-akairo';

export default class ResumeListener extends Listener {
	public constructor() {
		super('resumed', {
			emitter: 'client',
			event: 'resumed',
			category: 'client',
		});
	}

	public exec(events: number): void {
		this.client.logger.info(
			`[RESUME] You made it out fine thanks to my luck! You ought to be thankful! (replayed ${events} events)`,
		);
	}
}
