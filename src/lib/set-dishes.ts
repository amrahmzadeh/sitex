export interface SetItemEntry {
  id?: string;
  name: string;
  quantity?: string | number;
  portion?: string;
  price?: number;
  note?: string;
}

/**
 * Təhlükəsiz şəkildə setItems mətnini (JSON və ya düz mətn) SetItemEntry massivinə çevirir.
 */
export function parseSetItems(raw: string | null | undefined): SetItemEntry[] {
  if (!raw || typeof raw !== 'string') return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // Əgər JSON massividirsə
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((p) => p && (typeof p === 'object' ? Boolean(p.name) : Boolean(p)))
          .map((p) => {
            if (typeof p === 'string') return { name: p.trim(), quantity: '1' };
            return {
              id: p.id ? String(p.id) : undefined,
              name: String(p.name || '').trim(),
              quantity: p.quantity !== undefined && p.quantity !== null && String(p.quantity).trim() !== '' ? p.quantity : '1',
              portion: p.portion ? String(p.portion).trim() : undefined,
              price: typeof p.price === 'number' && !isNaN(p.price) ? p.price : undefined,
              note: p.note ? String(p.note).trim() : undefined,
            };
          });
      }
    } catch {
      // JSON parse xətası olarsa düz mətn kimi davam edir
    }
  }

  // Əgər sətir-sətir və ya vergüllə ayrılmış sadə mətndirsə
  return trimmed
    .split(/[\r\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      // "2x Pizza" və ya "2 x Pizza" formatı
      const match = line.match(/^(\d+)\s*[xX*]\s*(.+)$/);
      if (match) {
        return { name: match[2].trim(), quantity: match[1] };
      }
      return { name: line, quantity: '1' };
    });
}

/**
 * SetItemEntry massivini saxlanacaq JSON formatına çevirir.
 */
export function serializeSetItems(items: SetItemEntry[]): string {
  if (!Array.isArray(items)) return '[]';
  const clean = items
    .filter((i) => i && typeof i.name === 'string' && i.name.trim().length > 0)
    .map((i) => ({
      id: i.id || undefined,
      name: i.name.trim(),
      quantity: i.quantity || '1',
      portion: i.portion ? i.portion.trim() : undefined,
      price: typeof i.price === 'number' ? i.price : undefined,
      note: i.note ? i.note.trim() : undefined,
    }));
  return JSON.stringify(clean);
}

/**
 * Setin qısa xülasəsini (məs. "Pizza, Fri, 2x Kola") formatlayır.
 */
export function formatSetSummary(raw: string | null | undefined, maxItems = 4): string {
  const list = parseSetItems(raw);
  if (!list.length) return '';
  const parts = list.slice(0, maxItems).map((i) => {
    const qty = i.quantity && String(i.quantity) !== '1' ? `${i.quantity}x ` : '';
    return `${qty}${i.name}`;
  });
  if (list.length > maxItems) {
    parts.push(`+${list.length - maxItems} daha`);
  }
  return parts.join(', ');
}

