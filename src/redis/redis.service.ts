import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    async onModuleInit() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: null,
        });
    }

    async onModuleDestroy() {
        await this.client.quit();
    }

    getClient(): Redis {
        return this.client;
    }

    async saveToken(userId: number, token: string, ttl: number) {
        await this.client.set(`token:${userId}`, token, 'EX', ttl);
    }

    async blacklistToken(token: string, ttl: number) {
        await this.client.set(`blacklist:${token}`, 'blacklisted', 'EX', ttl);
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await this.client.get(`blacklist:${token}`);
        return result === 'blacklisted';
    }
}
