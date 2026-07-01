import { describe, it, expect, afterEach, vi } from "vitest";
import { resolveSsl } from "@/lib/db";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("resolveSsl", () => {
  it("no SSL for a localhost dev database", () => {
    expect(resolveSsl("postgres://ae:ae@localhost:5432/ae")).toBeUndefined();
    expect(resolveSsl("postgres://ae:ae@127.0.0.1:5432/ae")).toBeUndefined();
  });

  it("enables SSL when sslmode=require (managed hosts)", () => {
    expect(resolveSsl("postgres://u:p@ep-cool.neon.tech/db?sslmode=require")).toEqual({
      rejectUnauthorized: false,
    });
  });

  it("enables SSL via DATABASE_SSL=true", () => {
    vi.stubEnv("DATABASE_SSL", "true");
    expect(resolveSsl("postgres://u:p@host/db")).toEqual({ rejectUnauthorized: false });
  });

  it("forces SSL off via DATABASE_SSL=false even on a remote host", () => {
    vi.stubEnv("DATABASE_SSL", "false");
    expect(resolveSsl("postgres://u:p@host/db?sslmode=require")).toBeUndefined();
  });

  it("defaults to SSL for a remote host in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(resolveSsl("postgres://u:p@db.internal:5432/app")).toEqual({ rejectUnauthorized: false });
  });

  it("stays plaintext for localhost even in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(resolveSsl("postgres://u:p@localhost:5432/app")).toBeUndefined();
  });
});
