import { describe, it, expect, beforeEach } from "vitest";
import { getEnvConfig } from "./env";

describe("getEnvConfig", () => {

  beforeEach(() => {
    window._env_ = undefined as any;
  });

  it("uses runtime window._env_ values when available", () => {

    window._env_ = {
      VITE_BACKEND_AI_URL: "http://runtime-ai",
      VITE_BACKEND_API_URL: "http://runtime-api",
      VITE_N8N_WEBHOOK_URL: "http://runtime-webhook",
    };

    const config = getEnvConfig();

    expect(config.backendDetectUrl)
      .toBe("http://runtime-ai");

    expect(config.backendApiUrl)
      .toBe("http://runtime-api");

    expect(config.webhookUrl)
      .toBe("http://runtime-webhook");
  });

  it("returns all config values", () => {

    window._env_ = {
      VITE_BACKEND_AI_URL: "ai",
      VITE_BACKEND_API_URL: "api",
      VITE_N8N_WEBHOOK_URL: "webhook",
    };

    const config = getEnvConfig();

    expect(config).toEqual({
      backendDetectUrl: "ai",
      backendApiUrl: "api",
      webhookUrl: "webhook",
    });
  });

});