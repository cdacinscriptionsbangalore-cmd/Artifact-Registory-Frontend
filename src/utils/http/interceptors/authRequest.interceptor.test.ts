import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { attachAuthToken } from "../interceptors/authRequest.interceptor";
import { authStore } from "../../../store/authStore";

vi.mock("../../../store/authStore", () => ({
  authStore: {
    getToken: vi.fn(),
  },
}));

describe("attachAuthToken", () => {

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal(
      "window",
      {
        dispatchEvent: vi.fn(),
        location: {
          href: "",
        },
      }
    );
  });

  it("registers request interceptor", () => {

    const useMock = vi.fn();

    const client = {
      interceptors: {
        request: {
          use: useMock,
        },
      },
    };

    attachAuthToken(client as any);

    expect(useMock)
      .toHaveBeenCalledTimes(1);

  });

  it("adds authorization header when token exists", async () => {

    vi.mocked(authStore.getToken)
      .mockReturnValue("abc123");

    const useMock = vi.fn();

    const client = {
      interceptors: {
        request: {
          use: useMock,
        },
      },
    };

    attachAuthToken(client as any);

    const [handler] =
      useMock.mock.calls[0];

    const config = {
      headers: {},
    };

    const result =
      await handler(config);

    expect(
      result.headers.Authorization
    ).toBe(
      "Bearer abc123"
    );

  });

  it("does not dispatch unauthorized when token exists", async () => {

    vi.mocked(authStore.getToken)
      .mockReturnValue("abc123");

    const useMock = vi.fn();

    const client = {
      interceptors: {
        request: {
          use: useMock,
        },
      },
    };

    attachAuthToken(client as any);

    const [handler] =
      useMock.mock.calls[0];

    await handler({
      headers: {},
    });

    expect(
      window.dispatchEvent
    ).not.toHaveBeenCalled();

  });

  it("dispatches unauthorized when token is missing", async () => {

    vi.mocked(authStore.getToken)
      .mockReturnValue(null);

    const useMock = vi.fn();

    const client = {
      interceptors: {
        request: {
          use: useMock,
        },
      },
    };

    attachAuthToken(client as any);

    const [handler] =
      useMock.mock.calls[0];

    await expect(
      handler({
        headers: {},
      })
    ).rejects.toBeInstanceOf(
      axios.CanceledError
    );

    expect(
      window.dispatchEvent
    ).toHaveBeenCalledTimes(1);

  });

});