import { describe, it, expect, vi, beforeEach } from "vitest";
import verifyGPSInImage from "../../utils/GPS/verifyGPSInImage";
import piexifjs from "piexifjs";

vi.mock("piexifjs", () => ({
  default: {
    load: vi.fn(),
    GPSIFD: {
      GPSLatitude: 2,
      GPSLongitude: 4,
      GPSLatitudeRef: 1,
      GPSLongitudeRef: 3,
    },
  },
}));

const mockedLoad = vi.mocked(piexifjs.load);

describe("verifyGPSInImage", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false for non jpeg input", () => {

    const result = verifyGPSInImage("hello");

    expect(result).toEqual({
      hasGPS: false,
    });

  });

  it("returns false when GPS block is missing", () => {

    mockedLoad.mockReturnValue({
      GPS: {},
    } as any);

    const result = verifyGPSInImage(
      "data:image/jpeg;base64,test"
    );

    expect(result.hasGPS).toBe(false);

  });

  it("returns false when latitude is missing", () => {

    mockedLoad.mockReturnValue({
      GPS: {
        4: [[78, 1], [0, 1], [0, 1]],
      },
    } as any);

    const result = verifyGPSInImage(
      "data:image/jpeg;base64,test"
    );

    expect(result.hasGPS).toBe(false);

  });

  it("returns false when longitude is missing", () => {

    mockedLoad.mockReturnValue({
      GPS: {
        2: [[9, 1], [0, 1], [0, 1]],
      },
    } as any);

    const result = verifyGPSInImage(
      "data:image/jpeg;base64,test"
    );

    expect(result.hasGPS).toBe(false);

  });

  it("extracts coordinates correctly", () => {

    mockedLoad.mockReturnValue({
      GPS: {
        2: [[9, 1], [0, 1], [0, 1]],
        4: [[78, 1], [0, 1], [0, 1]],
        1: "N",
        3: "E",
      },
    } as any);

    const result = verifyGPSInImage(
      "data:image/jpeg;base64,test"
    );

    expect(result.hasGPS).toBe(true);

    expect(result.coordinates).toEqual({
      lat: 9,
      lon: 78,
    });

  });

  it("handles south and west coordinates", () => {

    mockedLoad.mockReturnValue({
      GPS: {
        2: [[9, 1], [0, 1], [0, 1]],
        4: [[78, 1], [0, 1], [0, 1]],
        1: "S",
        3: "W",
      },
    } as any);

    const result = verifyGPSInImage(
      "data:image/jpeg;base64,test"
    );

    expect(result.hasGPS).toBe(true);

    expect(result.coordinates).toEqual({
      lat: -9,
      lon: -78,
    });

  });

  it("returns false when piexif throws", () => {

    mockedLoad.mockImplementation(() => {
      throw new Error("EXIF failure");
    });

    const result = verifyGPSInImage(
      "data:image/jpeg;base64,test"
    );

    expect(result).toEqual({
      hasGPS: false,
    });

  });

});