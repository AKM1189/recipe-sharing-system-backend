import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Redis from 'ioredis';
import { env } from 'process';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis.Redis;
  onModuleInit() {
    this.client = new Redis.Redis({
      host: env.REDIS_HOST || 'redis',
      port: Number(env.REDIS_PORT) || 6379,
    });
  }
  onModuleDestroy() {
    this.client.quit();
  }

  async set(key: string, value: string, ttlInSeconds: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttlInSeconds);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async hSet(
    key: string,
    data: Record<string, string | number | boolean | null>,
    ttlInSeconds: number,
  ): Promise<void> {
    const formattedData: Record<string, string> = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)]),
    );
    await this.client.hset(key, formattedData);
    await this.client.expire(key, ttlInSeconds);
  }

  async hGetAll(key: string) {
    return await this.client.hgetall(key);
  }
}
