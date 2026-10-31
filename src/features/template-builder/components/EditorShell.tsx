'use client';

import { DndContext, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { useEditorStore, useDevice, useDirty, useCanUndo, useCanRedo } from '@/features/template-builder/hooks/useEditor';
import { useBlockRegistry } from '@/features/template-builder/hooks/useRegistry';
import { ComponentPalette } from '@/features/template-builder/components/ComponentPalette';
import { Canvas } from '@/features/template-builder/components/Canvas';
import { PropertiesPanel } from '@/features/template-builder/components/PropertiesPanel';
import { TopBar } from '@/features/template-builder/components/TopBar';
import { registerBuiltinBlocks } from '@/features/template-builder/registry/builtinBlocks';
import type { Template, TemplateNode } from '@/features/template-builder/types';

export interface EditorShellProps {
  onSave?: (template: Template) => void;
  onPublish?: (template: Template) => void;
}

export function EditorShell({ onSave, onPublish }: EditorShellProps) {
  const store = useEditorStore();
  const device = useDevice();
  const dirty = useDirty();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const { blocks } = useBlockRegistry();

  registerBuiltinBlocks();

  const handleSave = () => {
    const t = store.state.template;
    onSave?.(t);
    store.dispatch({ type: 'SET_DIRTY', payload: false });
  };
  const handlePublish = () => {
    onPublish?.(store.state.template);
  };
  const handleDeviceChange = (d: 'desktop' | 'tablet' | 'mobile') => store.setDevice(d);
  const handleNodeClick = (id: string) => store.setSelected(id);
  const handleNodeRemove = (id: string) => store.removeNode(id);
  const handleNodeUpdate = (id: string, patch: Partial<TemplateNode>) => store.updateNode(id, patch);

  const sensors = useSensors({ sensor: PointerSensor, options: {} }, { sensor: KeyboardSensor, options: {} });

  const handleDragEnd = (event: { active: { id: unknown }; over: { id: unknown } | null }) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const blockDef = blocks.find((b) => b.type === activeId);
    if (blockDef) {
      const newNode: TemplateNode = {
        id: crypto.randomUUID(),
        type: blockDef.type,
        props: { ...blockDef.defaultProps },
        styles: { ...blockDef.defaultStyles },
        children: [],
      };
      store.addNode(newNode, overId === 'root' ? 'root' : overId);
      return;
    }

    store.moveNode(activeId as string, overId as string, 0);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#ffffff' }}>
        <TopBar
          device={device}
          onDeviceChange={handleDeviceChange}
          onUndo={() => store.undo()}
          onRedo={() => store.redo()}
          onSave={handleSave}
          onPublish={handlePublish}
          canUndo={canUndo}
          canRedo={canRedo}
          dirty={dirty}
        />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <ComponentPalette />
          <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Canvas
              onNodeClick={handleNodeClick}
              onNodeRemove={handleNodeRemove}
              onNodeUpdate={handleNodeUpdate}
            />
          </main>
          <PropertiesPanel />
        </div>
      </div>
    </DndContext>
  );
}
