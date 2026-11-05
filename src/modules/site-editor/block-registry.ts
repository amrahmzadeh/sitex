// ============================================================
// Block Registry — plugin kimi yeni blok əlavə etmək üçün
// ============================================================

import type { BlockSchema } from './types';

const registry = new Map<string, BlockSchema>();

/** Yeni blok tipi qeydiyyatdan keçirir */
export function registerBlock(schema: BlockSchema): void {
  if (registry.has(schema.key)) {
    console.warn(`[site-editor] Block already registered: ${schema.key}`);
  }
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

