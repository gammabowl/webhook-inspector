import { Global, Module } from "@nestjs/common";
import { RedisStorageService } from "./redis-storage.service";
import { SqliteStorageService } from "./sqlite-storage.service";
import { WEBHOOK_STORAGE, WebhookStorage } from "./storage.interface";

const STORAGE_DRIVERS = ["sqlite", "redis"] as const;
type StorageDriver = (typeof STORAGE_DRIVERS)[number];

function resolveDriver(): StorageDriver {
  const requested = (process.env.STORAGE_DRIVER ?? "sqlite").trim().toLowerCase();

  if (!STORAGE_DRIVERS.includes(requested as StorageDriver)) {
    throw new Error(`Unsupported STORAGE_DRIVER "${requested}". Use "sqlite" or "redis".`);
  }

  return requested as StorageDriver;
}

@Global()
@Module({
  providers: [
    {
      provide: WEBHOOK_STORAGE,
      useFactory: (): WebhookStorage => {
        return resolveDriver() === "redis" ? new RedisStorageService() : new SqliteStorageService();
      },
    },
  ],
  exports: [WEBHOOK_STORAGE],
})
export class StorageModule {}
