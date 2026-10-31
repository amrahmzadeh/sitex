import { createContext, useContext, ReactNode } from 'react';
import { blockRegistry, type BlockDefinition } from '@/features/template-builder/registry/blockRegistry';

interface BlockRegistryContextValue {
  blocks: BlockDefinition[];
  register: (block: BlockDefinition) => void;
}

const BlockRegistryContext = createContext<BlockRegistryContextValue | null>(null);

export function BlockRegistryProvider({ children }: { children: ReactNode }) {
  return (
    <BlockRegistryContext.Provider value={{ blocks: blockRegistry.getAll(), register: (b) => blockRegistry.register(b) }}>
      {children}
    </BlockRegistryContext.Provider>
  );
}

export function useBlockRegistry() {
  const ctx = useContext(BlockRegistryContext);
  if (!ctx) throw new Error('useBlockRegistry must be used within BlockRegistryProvider');
  return ctx;
}

export type { BlockDefinition };
