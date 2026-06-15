import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  initDB,
  saveImageToIndexedDB,
} from "./indexedDB";

describe("indexedDB utilities", () => {

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("resolves database when open succeeds", async () => {

    const mockDb = {
      objectStoreNames: {
        contains: vi.fn(),
      },
    };

    const request: any = {};

    vi.stubGlobal("indexedDB", {
      open: vi.fn(() => {
        setTimeout(() => {
          request.result = mockDb;
          request.onsuccess?.();
        }, 0);

        return request;
      }),
    });

    const result = await initDB();

    expect(result).toBe(mockDb);

  });

  it("rejects when open fails", async () => {

    const request: any = {};

    vi.stubGlobal("indexedDB", {
      open: vi.fn(() => {
        setTimeout(() => {
          request.error =
            new Error("open failed");

          request.onerror?.();
        }, 0);

        return request;
      }),
    });

    await expect(
      initDB()
    ).rejects.toThrow("open failed");

  });

  it("saves image successfully", async () => {

    const addMock = vi.fn();

    const tx: any = {};

    const mockDb = {
      transaction: vi.fn(() => ({
        objectStore: () => ({
          add: addMock,
        }),
        set oncomplete(fn) {
          tx.oncomplete = fn;
        },
        set onerror(fn) {
          tx.onerror = fn;
        },
      })),
      objectStoreNames: {
        contains: vi.fn(),
      },
    };

    const request: any = {};

    vi.stubGlobal("indexedDB", {
      open: vi.fn(() => {

        setTimeout(() => {
          request.result = mockDb;
          request.onsuccess?.();
        }, 0);

        return request;
      }),
    });

    const promise =
      saveImageToIndexedDB({
        id: 1,
      } as any);

    setTimeout(() => {
      tx.oncomplete?.();
    }, 0);

    await expect(
      promise
    ).resolves.toBeUndefined();

    expect(addMock)
      .toHaveBeenCalled();

  });

});