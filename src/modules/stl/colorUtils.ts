// Safe pure-math color utility functions and WCAG contrast calculation
// No eval, no external untrusted execution

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const NAMED_COLORS: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'rgba(0,0,0,0)',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  gray: '#808080',
  grey: '#808080',
};

export function parseColor(input: string): RGBA | null {
  if (!input || typeof input !== 'string') return null;
  const str = input.trim().toLowerCase();

  if (NAMED_COLORS[str]) {
    return parseColor(NAMED_COLORS[str]);
  }

  // Hex colors: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b, a: 1 };
    }
    if (hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a = parseInt(hex[3] + hex[3], 16) / 255;
      return isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a) ? null : { r, g, b, a: Number(a.toFixed(3)) };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b, a: 1 };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a) ? null : { r, g, b, a: Number(a.toFixed(3)) };
    }
    return null;
  }

  // rgb / rgba: rgba(255, 255, 255, 0.5) or rgb(255 255 255 / 0.5)
  const rgbMatch = str.match(/^rgba?\s*\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+%?))?\s*\)$/i);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseFloat(rgbMatch[1])));
    const g = Math.min(255, Math.max(0, parseFloat(rgbMatch[2])));
    const b = Math.min(255, Math.max(0, parseFloat(rgbMatch[3])));
    let a = 1;
    if (rgbMatch[4] !== undefined) {
      if (rgbMatch[4].endsWith('%')) {
        a = Math.min(1, Math.max(0, parseFloat(rgbMatch[4]) / 100));
      } else {
        a = Math.min(1, Math.max(0, parseFloat(rgbMatch[4])));
      }
    }
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: Number(a.toFixed(3)) };
  }

  return null;
}

export function rgbaToString(rgba: RGBA): string {
  if (rgba.a === 1) {
    const toHex = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  }
  return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
}

export function lightenColor(colorStr: string, percent: number): string {
  const c = parseColor(colorStr);
  if (!c) return colorStr;
  const factor = Math.max(0, Math.min(100, percent)) / 100;
  const r = Math.round(c.r + (255 - c.r) * factor);
  const g = Math.round(c.g + (255 - c.g) * factor);
  const b = Math.round(c.b + (255 - c.b) * factor);
  return rgbaToString({ r, g, b, a: c.a });
}

export function darkenColor(colorStr: string, percent: number): string {
  const c = parseColor(colorStr);
  if (!c) return colorStr;
  const factor = 1 - Math.max(0, Math.min(100, percent)) / 100;
  const r = Math.round(c.r * factor);
  const g = Math.round(c.g * factor);
  const b = Math.round(c.b * factor);
  return rgbaToString({ r, g, b, a: c.a });
}

export function alphaColor(colorStr: string, alphaVal: number): string {
  const c = parseColor(colorStr);
  if (!c) return colorStr;
  const clamped = Math.max(0, Math.min(1, alphaVal));
  return rgbaToString({ ...c, a: Number(clamped.toFixed(3)) });
}

export function mixColors(color1: string, color2: string, weight = 50): string {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  if (!c1 || !c2) return color1;
  const p = Math.max(0, Math.min(100, weight)) / 100;
  const w = p * 2 - 1;
  const a = c1.a - c2.a;
  const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
  const w2 = 1 - w1;

  const r = Math.round(c1.r * w1 + c2.r * w2);
  const g = Math.round(c1.g * w1 + c2.g * w2);
  const b = Math.round(c1.b * w1 + c2.b * w2);
  const mixedAlpha = Number((c1.a * p + c2.a * (1 - p)).toFixed(3));
  return rgbaToString({ r, g, b, a: mixedAlpha });
}

// WCAG 2.2 Relative Luminance and Contrast Ratio
function getLuminanceComponent(val: number): number {
  const s = val / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function getRelativeLuminance(rgba: RGBA): number {
  const r = getLuminanceComponent(rgba.r);
  const g = getLuminanceComponent(rgba.g);
  const b = getLuminanceComponent(rgba.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(c1: string, c2: string): number | null {
  const rgba1 = parseColor(c1);
  const rgba2 = parseColor(c2);
  if (!rgba1 || !rgba2) return null;
  const l1 = getRelativeLuminance(rgba1);
  const l2 = getRelativeLuminance(rgba2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Number(ratio.toFixed(2));
}

export function checkWCAGContrast(fg: string, bg: string): {
  ratio: number;
  aaPass: boolean;
  aaaPass: boolean;
  aaLargePass: boolean;
} | null {
  const ratio = calculateContrastRatio(fg, bg);
  if (ratio === null) return null;
  return {
    ratio,
    aaPass: ratio >= 4.5,
    aaaPass: ratio >= 7.0,
    aaLargePass: ratio >= 3.0,
  };
}

