'use client';

import { useDraggable } from '@dnd-kit/core';
import { useBlockRegistry } from '@/features/template-builder/hooks/useRegistry';
import type { BlockDefinition } from '@/features/template-builder/types';
import { Plus, Type, Heading, Image, Play, Layout, Columns, Minus, Film, Mail } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  text: Type,
  heading: Heading,
  image: Image,
  button: Play,
  container: Layout,
  columns: Columns,
  divider: Minus,
  spacer: Minus,
  video: Film,
  'form-field': Mail,
};

function PaletteItem({ block }: { block: BlockDefinition }) {
  const Icon = ICONS[block.type] ?? Plus;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: block.type });
  const style: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8,
    border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13,
    fontWeight: 500, color: '#111827', width: '100%', textAlign: 'left',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };
  return (
    <div ref={setNodeRef} style={{ ...style }}>
      <button {...attributes} {...listeners} type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left' }}>
        <Icon size={16} color="#6b7280" />
        {block.name}
      </button>
    </div>
  );
}

export function ComponentPalette() {
  const { blocks } = useBlockRegistry();

  return (
    <aside style={{ width: 280, borderRight: '1px solid #e5e7eb', background: '#f8fafc', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#111827' }}>Bileşenler</h2>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Sürükleyip bırakın</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {blocks.map((block) => (
          <PaletteItem key={block.type} block={block} />
        ))}
      </div>
    </aside>
  );
}
