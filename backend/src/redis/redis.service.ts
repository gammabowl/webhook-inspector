import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
    this.client = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  get redis(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== "end") {
      await this.client.quit();
    }
  }
}

