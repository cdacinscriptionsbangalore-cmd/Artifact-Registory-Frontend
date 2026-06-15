import { describe, it, expect, vi } from "vitest";
import {
    extractEXIFData,
    parseEXIFForGPS,
    findGPSIFD,
    parseGPSData,
} from "./exifUtils";

describe("extractEXIFData", () => {

    it("rejects when FileReader fails", async () => {

        class MockFileReader {

            onload: any;
            onerror: any;

            readAsArrayBuffer() {
                this.onerror();
            }

        }

        vi.stubGlobal(
            "FileReader",
            MockFileReader
        );

        const file =
            new File(["test"], "test.jpg");

        await expect(
            extractEXIFData(file)
        ).rejects.toThrow(
            "Failed to read file"
        );

    });

    it("returns null when no EXIF block exists", async () => {

        const buffer =
            new ArrayBuffer(32);

        const view =
            new DataView(buffer);

        view.setUint16(0, 0xffd8);

        class MockFileReader {

            onload: any;

            readAsArrayBuffer() {
                this.onload({
                    target: {
                        result: buffer,
                    },
                });
            }

        }

        vi.stubGlobal(
            "FileReader",
            MockFileReader
        );

        const file =
            new File(["test"], "test.jpg");

        const result =
            await extractEXIFData(file);

        expect(result).toBeNull();

    });

    it("returns null for invalid EXIF data", async () => {

        const buffer =
            new ArrayBuffer(128);

        const view =
            new DataView(buffer);

        view.setUint16(0, 0xffd8);

        view.setUint16(2, 0xffe1);

        view.setUint16(4, 16);

        class MockFileReader {

            onload: any;

            readAsArrayBuffer() {
                this.onload({
                    target: {
                        result: buffer,
                    },
                });
            }

        }

        vi.stubGlobal(
            "FileReader",
            MockFileReader
        );

        const file =
            new File(["test"], "test.jpg");

        const result =
            await extractEXIFData(file);

        expect(result).toBeNull();

    });

    it("returns null when EXIF header is invalid", () => {

        const buffer = new ArrayBuffer(20);
        const view = new DataView(buffer);

        view.setUint8(0, 65); // A
        view.setUint8(1, 66); // B
        view.setUint8(2, 67); // C
        view.setUint8(3, 68); // D

        const result =
            parseEXIFForGPS(view);

        expect(result).toBeNull();

    });

    it("returns null when GPS refs are missing", () => {

        const buffer = new ArrayBuffer(32);
        const view = new DataView(buffer);

        view.setUint16(0, 0, true);

        const result =
            parseGPSData(
                view,
                0,
                true
            );

        expect(result).toBeNull();

    });

    it("returns null when GPS tag is absent", () => {

        const buffer = new ArrayBuffer(64);
        const view = new DataView(buffer);

        view.setUint16(0, 1, true);

        view.setUint16(2, 1234, true);

        const result =
            findGPSIFD(
                view,
                0,
                true
            );

        expect(result).toBeNull();

    });
});