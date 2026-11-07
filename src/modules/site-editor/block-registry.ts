// ============================================================
// Block Registry — plugin kimi yeni blok əlavə etmək üçün
// ============================================================

import type { BlockSchema } from './types';
import { heroBlockSchema } from './schemas/hero.schema';
import { aboutBlockSchema } from './schemas/about.schema';
import { contactBlockSchema } from './schemas/contact.schema';
import { menuBlockSchema } from './schemas/menu.schema';
import { galleryBlockSchema } from './schemas/gallery.schema';
import { reservationBlockSchema } from './schemas/reservation.schema';

const defaultSchemas: BlockSchema[] = [
  heroBlockSchema,
  aboutBlockSchema,
  contactBlockSchema,
  menuBlockSchema,
  galleryBlockSchema,
  reservationBlockSchema,
];

const registry = new Map<string, BlockSchema>();

// İlkin schema-ları qeydiyyatdan keçir
for (const schema of defaultSchemas) {
  registry.set(schema.key, schema);
}

/** Yeni blok tipi qeydiyyatdan keçirir */
export function registerBlock(schema: BlockSchema): void {
  registry.set(schema.key, schema);
}

/** Açara görə blok alır */
export function getBlock(key: string): BlockSchema | undefined {
  return registry.get(key);
}

/** Bütün bloklar */
export function getAllBlocks(): BlockSchema[] {
  return Array.from(registry.values());
}

/** Sayfa açarına görə bloklar */
export function getBlocksByPage(pageKey: string): BlockSchema[] {
  return getAllBlocks().filter((b) => b.pageKey === pageKey);
}

/** Mövcud sayfa açarları */
export function getPages(): string[] {
  const pages = new Set<string>();
  for (const schema of registry.values()) {
    pages.add(schema.pageKey);
  }
  return Array.from(pages);
}
