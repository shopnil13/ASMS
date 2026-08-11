import { describe, expect, it, vi } from "vitest";
import api from "@/lib/api";

describe("api client", () => {
  it("sends JWT bearer token from storage", async () => {
    localStorage.setItem("asms.token", "abc123");
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));

    api.defaults.adapter = adapter;
    await api.get("/Course");

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe("Bearer abc123");
  });
});
