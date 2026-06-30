export const normalizeCoordinate = (
  value: unknown
): string | null => {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value.toString()
      : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return null;

    const normalized =
      trimmed.includes(",") &&
      !trimmed.includes(".")
        ? trimmed.replace(",", ".")
        : trimmed;

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
      ? parsed.toString()
      : null;
  }

  return null;
};