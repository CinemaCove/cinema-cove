import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from './schemas/cache.schema';

@Injectable()
export class CacheService {
  constructor(
    @InjectModel(Cache.name) private readonly cacheModel: Model<Cache>,
  ) {}

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await factory();
    await this.set(key, value, ttlMs);
    return value;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = await this.cacheModel.findOne({ key }).exec();
    if (!entry) return undefined;
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    const expiresAt = ttlMs != null ? new Date(Date.now() + ttlMs) : null;
    await this.cacheModel
      .findOneAndUpdate({ key }, { value, expiresAt }, { upsert: true })
      .exec();
  }
}