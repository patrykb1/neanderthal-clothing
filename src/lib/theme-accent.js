const STORAGE_KEY = 'my-app.theme.accent-color';
let DEFAULT_ACCENT_COLOR = '#dc143c';

function normalizeHexColor(value) {
  const raw = String(value || '').trim().toLowerCase();
  const validHex = /^#([0-9a-f]{6})$/i;

  if (validHex.test(raw)) {
    return raw;
  }

  return DEFAULT_ACCENT_COLOR;
}

export { normalizeHexColor };

function hexToRgbTriplet(hexColor) {
  const normalized = normalizeHexColor(hexColor).replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return `${r}, ${g}, ${b}`;
}

function hexToRgb(hexColor) {
  const normalized = normalizeHexColor(hexColor).replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function channelToLinear(value) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function getRelativeLuminance(hexColor) {
  const { r, g, b } = hexToRgb(hexColor);
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  );
}

function getContrastRatio(hexColorA, hexColorB) {
  const luminanceA = getRelativeLuminance(hexColorA);
  const luminanceB = getRelativeLuminance(hexColorB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
}

function getAccessibleForegroundColor(hexColor) {
  const blackContrast = getContrastRatio(hexColor, '#000000');
  const whiteContrast = getContrastRatio(hexColor, '#ffffff');
  return whiteContrast >= blackContrast ? '#ffffff' : '#000000';
}

function hslToHex(hue, saturation, lightness) {
  const normalizedHue = ((hue % 360) + 360) % 360;
  const s = Math.max(0, Math.min(100, saturation)) / 100;
  const l = Math.max(0, Math.min(100, lightness)) / 100;

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const secondary = chroma * (1 - Math.abs(((normalizedHue / 60) % 2) - 1));
  const match = l - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (normalizedHue < 60) {
    red = chroma;
    green = secondary;
  } else if (normalizedHue < 120) {
    red = secondary;
    green = chroma;
  } else if (normalizedHue < 180) {
    green = chroma;
    blue = secondary;
  } else if (normalizedHue < 240) {
    green = secondary;
    blue = chroma;
  } else if (normalizedHue < 300) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  const toHex = (value) => Math.round((value + match) * 255).toString(16).padStart(2, '0');
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export function getAccentColorForKey(key) {
  const seed = String(key || '').trim().toLowerCase();
  if (!seed) {
    return DEFAULT_ACCENT_COLOR;
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const hue = hash % 360;
  const saturation = 78;
  const lightness = 56;
  return hslToHex(hue, saturation, lightness);
}

export function getDefaultAccentColor() {
  return DEFAULT_ACCENT_COLOR;
}

export function setDefaultAccentColor(color) {
  const normalized = normalizeHexColor(color);
  DEFAULT_ACCENT_COLOR = normalized;
  return normalized;
}

export function getSavedAccentColor() {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCENT_COLOR;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return normalizeHexColor(stored || DEFAULT_ACCENT_COLOR);
  } catch (_error) {
    return DEFAULT_ACCENT_COLOR;
  }
}

export function applyAccentColorToDocument(color) {
  if (typeof document === 'undefined') {
    return;
  }

  const normalized = normalizeHexColor(color);
  document.documentElement.style.setProperty('--theme-accent', normalized);
  document.documentElement.style.setProperty('--theme-accent-rgb', hexToRgbTriplet(normalized));
  document.documentElement.style.setProperty('--theme-accent-foreground', getAccessibleForegroundColor(normalized));
}

export function saveAccentColor(color) {
  const normalized = normalizeHexColor(color);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (_error) {
      // Ignore localStorage failures and still apply in-memory for this session.
    }
  }

  setDefaultAccentColor(normalized);
  applyAccentColorToDocument(normalized);
  return normalized;
}

export function loadAndApplySavedAccentColor() {
  const color = getSavedAccentColor();
  applyAccentColorToDocument(color);
  return color;
}
