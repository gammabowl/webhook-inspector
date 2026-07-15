import { All, Controller, Delete, Get, Param, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { StoredWebhookRequest, WebhookService } from "./webhook.service";

const WEBHOOK_ID_ROUTE_PATTERN =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}";

@Controller()
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get("/api/requests/:webhookId")
  async listRequests(
    @Param("webhookId") webhookId: string,
    @Query("since") since?: string,
    @Query("limit") limit?: string,
  ): Promise<{ webhookId: string; requests: StoredWebhookRequest[] }> {
    const parsedSince = Number(since ?? 0);
    const parsedLimit = Number(limit ?? 50);

    return {
      webhookId,
      requests: await this.webhookService.listRequests(webhookId, Number.isFinite(parsedSince) ? parsedSince : 0, parsedLimit),
    };
  }

  @Delete("/api/requests/:webhookId")
  async clearRequests(@Param("webhookId") webhookId: string): Promise<{ ok: true; cleared: number }> {
    return {
      ok: true,
      cleared: await this.webhookService.clearRequests(webhookId),
    };
  }

  @Delete("/api/requests/:webhookId/:requestId")
  async deleteRequest(
    @Param("webhookId") webhookId: string,
    @Param("requestId") requestId: string,
  ): Promise<{ ok: true; deleted: boolean }> {
    return {
      ok: true,
      deleted: await this.webhookService.deleteRequest(webhookId, requestId),
    };
  }

  @All(`/:webhookId(${WEBHOOK_ID_ROUTE_PATTERN})`)
  async receiveWebhook(@Param("webhookId") webhookId: string, @Req() req: Request): Promise<{ ok: true; id: string }> {
    const record = await this.webhookService.storeWebhookRequest(webhookId, req);
    return { ok: true, id: record.id };
  }

  @All(`/webhook/:webhookId(${WEBHOOK_ID_ROUTE_PATTERN})`)
  async receiveWebhookLegacy(@Param("webhookId") webhookId: string, @Req() req: Request): Promise<{ ok: true; id: string }> {
    const record = await this.webhookService.storeWebhookRequest(webhookId, req);
    return { ok: true, id: record.id };
  }

  @Get("/health")
  health(): { ok: true } {
    return { ok: true };
  }
}
