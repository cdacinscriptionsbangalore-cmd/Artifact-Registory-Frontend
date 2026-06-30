import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorInterceptor } from "../interceptors/error.interceptor";

describe("errorInterceptor", () => {
  let useMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useMock = vi.fn();

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

  it("registers a response interceptor", () => {

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    errorInterceptor(client as any);

    expect(useMock).toHaveBeenCalledTimes(1);

  });

  it("dispatches app:unauthorized on 401", async () => {

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    errorInterceptor(client as any);

    const [, errorHandler] =
      useMock.mock.calls[0];

    const error = {
      response: {
        status: 401,
      },
    };

    await expect(
      errorHandler(error)
    ).rejects.toBe(error);

    expect(
      window.dispatchEvent
    ).toHaveBeenCalledTimes(1);

  });

  it("does not dispatch for non-401 errors", async () => {

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    errorInterceptor(client as any);

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

    expect(
      window.dispatchEvent
    ).not.toHaveBeenCalled();

  });

  it("falls back to login redirect if dispatch throws", async () => {

    vi.stubGlobal(
      "window",
      {
        dispatchEvent: vi.fn(() => {
          throw new Error("boom");
        }),
        location: {
          href: "",
        },
      }
    );

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    errorInterceptor(client as any);

    const [, errorHandler] =
      useMock.mock.calls[0];

    const error = {
      response: {
        status: 401,
      },
    };

    await expect(
      errorHandler(error)
    ).rejects.toBe(error);

    expect(
      window.location.href
    ).toBe("/login");

  });

  it("always rejects the original error", async () => {

    const client = {
      interceptors: {
        response: {
          use: useMock,
        },
      },
    };

    errorInterceptor(client as any);

    const [, errorHandler] =
      useMock.mock.calls[0];

    const error = {
      message: "failure",
    };

    await expect(
      errorHandler(error)
    ).rejects.toBe(error);

  });

});