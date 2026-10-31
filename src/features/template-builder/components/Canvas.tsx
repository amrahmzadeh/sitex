'use client';

import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '@/features/template-builder/hooks/useEditor';
import { useBlockRegistry } from '@/features/template-builder/hooks/useRegistry';
import type { TemplateNode, NodeId } from '@/features/template-builder/types';

export interface CanvasProps {
  onNodeClick: (id: NodeId) => void;
  onNodeRemove: (id: NodeId) => void;
  onNodeUpdate: (id: NodeId, patch: Partial<TemplateNode>) => void;
}

export function Canvas({ onNodeClick, onNodeRemove, onNodeUpdate }: CanvasProps) {
  const store = useEditorStore();

  const nodes = store.state.template.nodes;
  const rootNode = nodes.find((n) => n.id === 'root');
  const { setNodeRef: setRootRef } = useDroppable({ id: 'root' });

  const hasContent = nodes.some((n) => n.id !== 'root');

  return (
    <div className="canvas-wrapper" style={{ flex: 1, overflow: 'auto', background: '#f3f4f6', position: 'relative' }}>
      <div ref={setRootRef} style={{ padding: 24, minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {!hasContent ? (
          <div style={{ color: '#9ca3af', fontSize: 14, marginTop: 40 }}>
            Boş canvas — sol panelden bir bileşen sürükleyin
          </div>
        ) : (
          <div>
            {(rootNode?.children ?? []).map((cid) => {
              const childNode = findChild(nodes, cid);
              return childNode ? (
                <CanvasNode
                  key={cid}
                  node={childNode}
                  onNodeClick={onNodeClick}
                  onNodeRemove={onNodeRemove}
                  onNodeUpdate={onNodeUpdate}
                />
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CanvasNode({
  node,
  onNodeClick,
  onNodeRemove,
  onNodeUpdate,
}: {
  node: TemplateNode;
  onNodeClick: (id: NodeId) => void;
  onNodeRemove: (id: NodeId) => void;
  onNodeUpdate: (id: NodeId, patch: Partial<TemplateNode>) => void;
}) {
  const store = useEditorStore();
  const { blocks } = useBlockRegistry();
  const blockDef = blocks.find((b) => b.type === node.type);
  const selected = store.state.selectedId === node.id;

  const { attributes, listeners, setNodeRef, transform, transition, isSorting } = useSortable({ id: node.id });
  const { isOver } = useDroppable({ id: node.id });

  const children = node.children.map((cid) => {
    const childNode = findChild(store.state.template.nodes, cid);
    return childNode ? (
      <CanvasNode
        key={cid}
        node={childNode}
        onNodeClick={onNodeClick}
        onNodeRemove={onNodeRemove}
        onNodeUpdate={onNodeUpdate}
      />
    ) : null;
  });

  const style: React.CSSProperties = {
    ...node.styles,
    position: 'relative',
    cursor: 'pointer',
    outline: selected ? '2px solid #00D37D' : '2px solid transparent',
    outlineOffset: '-2px',
    marginBottom: 8,
    boxSizing: 'border-box',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isSorting ? 0 : 1,
    background: isOver ? 'rgba(0,211,125,0.1)' : undefined,
  };

  return (
    <div {...attributes} {...listeners} ref={setNodeRef} style={style} onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }}>
      {blockDef ? (
        <blockDef.component
          node={node}
          selected={selected}
          onSelect={onNodeClick}
          onUpdate={(patch) => onNodeUpdate(node.id, patch)}
        />
      ) : (
        <div style={{ color: '#9ca3af', fontSize: 12, padding: 8 }}>(bilinmeyen blok: {node.type})</div>
      )}
      {node.children.length > 0 && (
        <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px dashed #cbd5e1' }}>
          {children}
        </div>
      )}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNodeRemove(node.id); }}
        style={{
          position: 'absolute', top: 4, right: 4,
          opacity: selected ? 1 : 0,
          background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none',
          borderRadius: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        ×
      </button>
    </div>
  );
}

function findChild(nodes: TemplateNode[], id: NodeId): TemplateNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findChild(
      n.children.map((cid) => nodes.find((x) => x.id === cid)).filter(Boolean) as TemplateNode[],
      id
    );
    if (found) return found;
  }
  return undefined;
}
