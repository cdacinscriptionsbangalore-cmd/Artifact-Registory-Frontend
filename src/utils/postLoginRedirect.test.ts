import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setPostLoginRedirect,
  getPostLoginRedirect,
  clearPostLoginRedirect,
  consumePostLoginRedirect,
} from "./postLoginRedirect";

// sessionStorage is a browser API — Node doesn't have it.
// vi.stubGlobal patches it onto the global before any test runs,
// so postLoginRedirect.ts sees it when its functions are called.
let _store: Record<string, string> = {};

vi.stubGlobal("sessionStorage", {
  getItem: (key: string): string | null => _store[key] ?? null,
  setItem: (key: string, value: string) => { _store[key] = String(value); },
  removeItem: (key: string) => { delete _store[key]; },
  clear: () => { _store = {}; },
});

describe("postLoginRedirect", () => {

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("stores redirect path", () => {
    setPostLoginRedirect("/upload");

    expect(
      getPostLoginRedirect()
    ).toBe("/upload");
  });

  it("clears redirect path", () => {
    setPostLoginRedirect("/upload");
    clearPostLoginRedirect();

    expect(
      getPostLoginRedirect()
    ).toBeNull();
  });

  it("consumes redirect path", () => {
    setPostLoginRedirect("/upload");

    expect(
      consumePostLoginRedirect()
    ).toBe("/upload");

    expect(
      getPostLoginRedirect()
    ).toBeNull();
  });

  it("rejects unsafe paths", () => {
    setPostLoginRedirect("//evil.com");

    expect(
      getPostLoginRedirect()
    ).toBeNull();
  });

  it("rejects relative paths", () => {

    setPostLoginRedirect("upload");

    expect(
      getPostLoginRedirect()
    ).toBeNull();

  });

  it("returns null for unsafe stored value", () => {

    sessionStorage.setItem(
      "auth:post-login-redirect",
      "//evil.com"
    );

    expect(
      getPostLoginRedirect()
    ).toBeNull();

  });
});