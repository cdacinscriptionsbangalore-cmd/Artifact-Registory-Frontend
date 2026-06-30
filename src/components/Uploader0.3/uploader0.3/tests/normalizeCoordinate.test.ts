import { describe, it, expect } from "vitest";
import { normalizeCoordinate } from "../utils/normalizeCoordinate";

describe("normalizeCoordinate", () => {

  it("handles decimal string", () => {
    expect(
      normalizeCoordinate("9.393774")
    ).toBe("9.393774");
  });

  it("trims whitespace", () => {
    expect(
      normalizeCoordinate(" 9.393774 ")
    ).toBe("9.393774");
  });

  it("handles comma decimal separator", () => {
    expect(
      normalizeCoordinate("9,393774")
    ).toBe("9.393774");
  });

  it("handles number", () => {
    expect(
      normalizeCoordinate(78.098459)
    ).toBe("78.098459");
  });

  it("returns null for empty string", () => {
    expect(
      normalizeCoordinate("")
    ).toBeNull();
  });

  it("returns null for invalid string", () => {
    expect(
      normalizeCoordinate("abc")
    ).toBeNull();
  });

  //////////////////
  it("returns null for null", () => {
    expect(
      normalizeCoordinate(null)
    ).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(
      normalizeCoordinate(undefined)
    ).toBeNull();
  });

  it("returns null for NaN", () => {
    expect(
      normalizeCoordinate(NaN)
    ).toBeNull();
  });

  it("returns null for infinity", () => {
    expect(
      normalizeCoordinate(Infinity)
    ).toBeNull()
  })
});