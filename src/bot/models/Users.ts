import { Entity, Column, Index, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User {
	@Index()
	@PrimaryColumn({ type: 'bigint' })
	public user!: string;

    @Index()
    @Column({ type: 'bigint' })
	public ani!: string;
}
