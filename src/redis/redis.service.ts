import { Injectable, NotImplementedException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    async onModuleInit() {
        if (!this.client) {
            this.client = new Redis(`redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PORT}`);
    
            this.client.on('error', () => { console.log('error')} )
            this.client.on('connect', () => { console.log('connected')} )
            this.client.on('ready', () => { console.log('ready')} )

        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
        }
    }

    getClient(): Redis {
        return this.client;
    }

    async saveToken(userId: number, token: string, ttl: number) {
        try {
            await this.client.set(`token:${userId}`, token, 'EX', ttl);
        } catch (error: any) {
            throw new NotImplementedException('Cannot save token to Redis');
        }
    }

    async blacklistToken(token: string, ttl: number) {
        try {
            await this.client.set(`blacklist:${token}`, 'blacklisted', 'EX', ttl);
        } catch (error: any) {
            throw new NotImplementedException('Cannot save token to blacklist');
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await this.client.get(`blacklist:${token}`);
        return result === 'blacklisted';
    }
}
