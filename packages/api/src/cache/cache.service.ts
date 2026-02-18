import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CacheEntry {
  value: unknown;
  expiresAt: number | null; // null = never expires
}

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, CacheEntry>();
  private readonly filePath: string;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.filePath = path.join(process.cwd(), 'cache', 'tmdb-cache.json');
  }

  async onModuleInit() {
    await this.load();
  }

  private async load() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data) as Record<string, CacheEntry>;
      const now = Date.now();
      for (const [key, entry] of Object.entries(parsed)) {
        if (entry.expiresAt === null || entry.expiresAt > now) {
          this.store.set(key, entry);
        }
      }
      this.logger.log(`Cache loaded: ${this.store.size} valid entries`);
    } catch {
      // File doesn't exist yet — start fresh
    }
  }

  private scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.save().catch((e) => this.logger.error('Cache save failed', e));
    }, 500);
  }

  private async save() {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    const obj: Record<string, CacheEntry> = {};
    for (const [key, entry] of this.store) {
      obj[key] = entry;
    }
    await fs.writeFile(this.filePath, JSON.stringify(obj));
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlMs != null ? Date.now() + ttlMs : null,
    });
    this.scheduleSave();
  }
}