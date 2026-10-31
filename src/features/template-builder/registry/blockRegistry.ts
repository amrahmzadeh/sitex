import type { BlockDefinition, BlockRegistry } from '@/features/template-builder/types';

const registry = new Map<string, BlockDefinition>();

export class BlockRegistryImpl implements BlockRegistry {
  register(block: BlockDefinition): void {
    if (registry.has(block.type)) {
      console.warn(`[template-builder] Block type "${block.type}" already registered, overwriting`);
    }
    registry.set(block.type, block);
  }

  get(type: string): BlockDefinition | undefined {
    return registry.get(type);
  }

  getAll(): BlockDefinition[] {
    return Array.from(registry.values());
  }

  has(type: string): boolean {
    return registry.has(type);
  }
}

export const blockRegistry = new BlockRegistryImpl();

export function registerBlock(block: BlockDefinition): void {
  blockRegistry.register(block);
}

export type { BlockDefinition };
