import { Entity, Column, Index, PrimaryColumn } from 'typeorm';

/* eslint-disable @typescript-eslint/explicit-member-accessibility */

@Entity('users')
export class User {
	@Index()
	@PrimaryColumn({ type: 'bigint' })
	user!: string;

    @Index()
    @Column({ type: 'bigint' })
	ani!: string;
}
