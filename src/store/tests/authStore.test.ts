import { describe, it, expect, beforeEach } from "vitest";
import { authStore } from "../authStore";
import { logout } from "../../utils/auth"; // relative path — @/ alias is not configured for Vitest

describe("authStore", () => {

  beforeEach(() => {
    authStore.clear();
  });

  it("returns null initially", () => {
    expect(authStore.getToken()).toBeNull();
  });

  it("stores token", () => {
    authStore.setToken("abc123");

    expect(
      authStore.getToken()
    ).toBe("abc123");
  });

  it("clears token", () => {
    authStore.setToken("abc123");

    authStore.clear();

    expect(
      authStore.getToken()
    ).toBeNull();
  });

  it("clears token on logout", () => {
    authStore.setToken("abc");

    logout();

    expect(
      authStore.getToken()
    ).toBeNull(); // clear() sets accessToken = null, not false
  });

  it("overwrites existing token", () => {
    authStore.setToken("old");
    authStore.setToken("new");

    expect(
      authStore.getToken()
    ).toBe("new");
  });
  
  it("clear can be called multiple times", () => {
    authStore.clear();
    authStore.clear();

    expect(
      authStore.getToken()
    ).toBeNull();
  });
});