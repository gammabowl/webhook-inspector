import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { StorageModule } from "./storage/storage.module";
import { WebhookModule } from "./webhook/webhook.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StorageModule,
    WebhookModule,
  ],
})
export class AppModule {}
