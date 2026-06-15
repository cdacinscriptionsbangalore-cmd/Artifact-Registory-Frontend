import { describe, it, expect, vi, beforeEach } from "vitest";
import { refreshTokenInterceptor } from "../interceptors/refreshToken.interceptor";
import { authStore } from "../../../store/authStore";
import { authClient } from "../clients/authClient.client";

vi.mock("../../../store/authStore", () => ({
  authStore: {
    setToken: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock("../clients/authClient.client", () => ({
  authClient: {
    post: vi.fn(),
  },
}));

describe("refreshTokenInterceptor", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers response interceptor", () => {

    const useMock = vi.fn();

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    refreshTokenInterceptor(client as any);

    expect(useMock)
      .toHaveBeenCalledTimes(1);

  });

  it("rejects non 401 errors", async () => {

    const useMock = vi.fn();

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    refreshTokenInterceptor(client as any);

    const [, errorHandler] =
      useMock.mock.calls[0];

    const error = {
      response: {
        status: 500,
      },
    };

    await expect(
      errorHandler(error)
    ).rejects.toBe(error);

  });

  it("refreshes token and retries request", async () => {

    const useMock = vi.fn();

    const retryResponse = {
      data: "retried",
    };

    const client = vi.fn()
      .mockResolvedValue(retryResponse);

    client.interceptors = {
      response: {
        use: useMock,
      },
    };

    vi.mocked(authClient.post)
      .mockResolvedValue({
        data: {
          auth_token: "new-token",
        },
      } as any);

    refreshTokenInterceptor(client as any);

    const [, errorHandler] =
      useMock.mock.calls[0];

    const error = {
      response: {
        status: 401,
      },
      config: {
        url: "/test",
        headers: {},
      },
    };

    const result =
      await errorHandler(error);

    expect(authStore.setToken)
      .toHaveBeenCalledWith(
        "new-token"
      );

    expect(client)
      .toHaveBeenCalled();

    expect(result)
      .toEqual(retryResponse);

  });

  it("clears auth when refresh fails", async () => {

    const useMock = vi.fn();

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    vi.mocked(authClient.post)
      .mockRejectedValue(
        new Error("refresh failed")
      );

    vi.stubGlobal(
      "window",
      {
        dispatchEvent: vi.fn(),
        location: {
          href: "",
        },
      }
    );

    refreshTokenInterceptor(client as any);

    const [, errorHandler] =
      useMock.mock.calls[0];

    const error = {
      response: {
        status: 401,
      },
      config: {},
    };

    await expect(
      errorHandler(error)
    ).rejects.toThrow();

    expect(authStore.clear)
      .toHaveBeenCalled();

    expect(
      window.dispatchEvent
    ).toHaveBeenCalled();

  });

  it("fails when refresh response contains no token", async () => {

    const useMock = vi.fn();

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    vi.mocked(authClient.post)
      .mockResolvedValue({
        data: {},
      } as any);

    vi.stubGlobal(
      "window",
      {
        dispatchEvent: vi.fn(),
        location: {
          href: "",
        },
      }
    );

    refreshTokenInterceptor(client as any);

    const [, errorHandler] =
      useMock.mock.calls[0];

    const error = {
      response: {
        status: 401,
      },
      config: {},
    };

    await expect(
      errorHandler(error)
    ).rejects.toThrow();

    expect(authStore.clear)
      .toHaveBeenCalled();

  });

});