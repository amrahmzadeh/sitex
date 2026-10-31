export function generateId(): string {
  return crypto.randomUUID();
}

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function isValidNodeId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function px(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const num = Number(value);
  return Number.isNaN(num) ? String(value) : `${num}px`;
}
