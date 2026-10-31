import { registerBlock } from '@/features/template-builder/registry/blockRegistry';
import { BUILTIN_BLOCKS } from '@/features/template-builder/components/blocks';

export function registerBuiltinBlocks(): void {
  for (const block of BUILTIN_BLOCKS) {
    registerBlock(block);
  }
}
