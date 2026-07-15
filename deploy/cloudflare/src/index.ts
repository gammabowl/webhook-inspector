import { applyCors, preflight } from "./cors";
import { CloudflareEnv } from "./env";
import { routeRequest } from "./router";
import { errorJson } from "./responses";

export default {
  async fetch(request: Request, env: CloudflareEnv): Promise<Response> {
    if (request.method === "OPTIONS") {
      return preflight(env);
    }

    try {
      const response = await routeRequest(request, env);
      return applyCors(response, env);
    } catch (error) {
      console.error(error);
      return applyCors(errorJson(500, "Internal server error"), env);
    }
  },
};
