import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis.Redis;
  onModuleInit() {
    this.client = new Redis.Redis(process.env.REDIS_HOST!);
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

  async deleteMany(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length) return await this.client.del(keys);
    return 0;
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
