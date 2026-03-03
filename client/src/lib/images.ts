function splitUrl(input: string) {
  const trimmed = input.trim();
  const qIndex = trimmed.indexOf("?");
  const hIndex = trimmed.indexOf("#");
  const cutIndex = [qIndex, hIndex].filter((idx) => idx >= 0).sort((a, b) => a - b)[0];
  if (cutIndex === undefined) return { pathOnly: trimmed, suffix: "" };
  return {
    pathOnly: trimmed.slice(0, cutIndex),
    suffix: trimmed.slice(cutIndex),
  };
}

export function previewImageUrl(input: string | null | undefined): string {
  if (!input) return "";
  const { pathOnly, suffix } = splitUrl(input);
  if (pathOnly.endsWith("-sm.webp")) return input;
  if (!pathOnly.endsWith(".webp")) return input;
  return `${pathOnly.slice(0, -5)}-sm.webp${suffix}`;
}

