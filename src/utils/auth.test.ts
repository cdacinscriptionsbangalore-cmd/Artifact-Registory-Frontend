import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isAuthenticated,
  setAuthToken,
  removeAuthToken,
  logout,
} from "./auth";
import { authStore } from "@/store/authStore";

vi.mock("@/store/authStore", () => ({
  authStore: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    clear: vi.fn(),
  },
}));

describe("auth utilities", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when token exists", () => {

    vi.mocked(authStore.getToken)
      .mockReturnValue("abc123");

    expect(
      isAuthenticated()
    ).toBe(true);

  });

  it("returns false when token does not exist", () => {

    vi.mocked(authStore.getToken)
      .mockReturnValue(null);

    expect(
      isAuthenticated()
    ).toBe(false);

  });

  it("setAuthToken delegates to authStore", () => {

    setAuthToken("token123");

    expect(authStore.setToken)
      .toHaveBeenCalledWith(
        "token123"
      );

  });

  it("removeAuthToken clears authStore", () => {

    removeAuthToken();

    expect(authStore.clear)
      .toHaveBeenCalledTimes(1);

  });

  it("logout clears authStore", () => {

    logout();

    expect(authStore.clear)
      .toHaveBeenCalledTimes(1);

  });

});