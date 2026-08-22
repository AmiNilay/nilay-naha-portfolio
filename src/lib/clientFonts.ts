const CONFIGURED_FONT_NAMES = new Set([
  "Inter",
  "Story Script",
  "Bitcount Prop Single",
  "Bitcount Prop Single Ink",
  "Bitcount Grid Single",
  "Allura",
  "Italianno",
  "Alex Brush",
  "Corinthia",
  "Carattere",
  "Kaushan Script",
  "Praise",
  "Londrina Shadow",
  "Rouge Script",
  "Libertinus Keyboard",
  "Birthstone",
  "Dancing Script",
]);

const FONT_READY_TIMEOUT_MS = 3500;

export async function waitForConfiguredFonts(
  settings: Record<string, unknown> | null | undefined,
): Promise<void> {
  if (typeof document === "undefined" || !settings || !document.fonts) return;

  const fonts = Array.from(
    new Set(
      Object.entries(settings)
        .filter(
          ([key, value]) =>
            key.toLowerCase().endsWith("font") &&
            typeof value === "string" &&
            CONFIGURED_FONT_NAMES.has(value),
        )
        .map(([, value]) => value as string),
    ),
  );

  if (fonts.length === 0) return;

  const loadFonts = Promise.allSettled(
    fonts.map((font) =>
      document.fonts.load(`16px "${font.replace(/"/g, '\\"')}"`),
    ),
  ).then(() => undefined);

  const timeout = new Promise<void>((resolve) => {
    window.setTimeout(resolve, FONT_READY_TIMEOUT_MS);
  });

  await Promise.race([loadFonts, timeout]);
}

export function isConfiguredFont(value: unknown): value is string {
  return typeof value === "string" && CONFIGURED_FONT_NAMES.has(value);
}

export { CONFIGURED_FONT_NAMES };
