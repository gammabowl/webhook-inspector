import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? true,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE", "HEAD"],
    allowedHeaders: "*",
  });

  const captureRawBody = (req: any, _res: unknown, buf: Buffer): void => {
    if (buf?.length) {
      req.rawBody = buf.toString("utf8");
    }
  };

  app.use(bodyParser.json({ limit: "1mb", verify: captureRawBody }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "1mb", verify: captureRawBody }));
  app.use(
    bodyParser.text({
      type: ["text/*", "application/graphql", "application/xml", "application/*+xml"],
      limit: "1mb",
      verify: captureRawBody,
    }),
  );
  app.use(bodyParser.raw({ type: ["application/octet-stream"], limit: "1mb", verify: captureRawBody }));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
