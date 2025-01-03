import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: null })
    @Exclude()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: '' })
    fullname: string;

    @Column({ default: null })
    avatarUrl: string;

    @Column({ default: false })
    isGoogleAccount: boolean;

    @Column({ default: false })
    isActive: boolean;

    @Column({ default: null })
    activationToken: string;

    @CreateDateColumn()
    @Exclude()
    createdAt: Date;

    @UpdateDateColumn()
    @Exclude()
    updatedAt: Date;
}
