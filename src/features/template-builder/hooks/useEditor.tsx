import { createContext, useContext, useMemo, ReactNode } from 'react';
import { createEditorStore, type EditorStore } from '@/features/template-builder/store';
import { createEmptyTemplate } from '@/features/template-builder/store/editorStore';
import { generateId } from '@/features/template-builder/utils';
import type { Template, TemplateNode, NodeId } from '@/features/template-builder/types';

interface TemplateBuilderContextValue {
  store: EditorStore;
}

const TemplateBuilderContext = createContext<TemplateBuilderContextValue | null>(null);

export function TemplateBuilderProvider({ children, template }: { children: ReactNode; template?: Template }) {
  const store = useMemo(() => {
    const initial = template ?? createEmptyTemplate(generateId(), 'Yeni Şablon');
    return createEditorStore(initial);
  }, [template]);

  return (
    <TemplateBuilderContext.Provider value={{ store }}>
      {children}
    </TemplateBuilderContext.Provider>
  );
}

export function useEditorStore(): EditorStore {
  const ctx = useContext(TemplateBuilderContext);
  if (!ctx) throw new Error('useEditorStore must be used within TemplateBuilderProvider');
  return ctx.store;
}

export function useBlockRegistry() {
  throw new Error('useBlockRegistry must be used within TemplateBuilderRegistryProvider');
}

export function useTemplate() {
  const store = useEditorStore();
  return store.state.template;
}

export function useSelectedId() {
  const store = useEditorStore();
  return store.state.selectedId;
}

export function useSelectedNode() {
  const store = useEditorStore();
  return store.getSelectedNode();
}

export function useDevice() {
  const store = useEditorStore();
  return store.state.device;
}

export function useDirty() {
  const store = useEditorStore();
  return store.state.dirty;
}

export function useCanUndo() {
  const store = useEditorStore();
  return store.canUndo();
}

export function useCanRedo() {
  const store = useEditorStore();
  return store.canRedo();
}

export type { EditorStore, Template, TemplateNode, NodeId };
