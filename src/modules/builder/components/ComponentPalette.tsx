'use client';

import React, { useState } from 'react';
import { listComponents } from '../registry/componentRegistry';
import { BuilderNode } from '../types';
import { Layers, Plus, MoveUp, MoveDown, Copy, Trash2 } from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
  nodes: BuilderNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onMoveNode: (id: string, direction: 'up' | 'down') => void;
  onDuplicateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
}

export function ComponentPalette({
  onAddComponent,
  nodes,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  onDuplicateNode,
  onDeleteNode,
}: ComponentPaletteProps) {
  const [activeTab, setActiveTab] = useState<'components' | 'layers'>('components');
  const components = listComponents();

  return (
    <div style={{ width: 300, borderRight: '1px solid #383334', display: 'flex', flexDirection: 'column', background: '#181B1E' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #383334' }}>
        <button
          onClick={() => setActiveTab('components')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'components' ? '#22252A' : 'transparent',
            color: activeTab === 'components' ? '#00D37D' : '#B0B0B8',
            border: 'none',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Bileşenlər
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          style={{
            flex: 1,
            padding: '12px',
            background: activeTab === 'layers' ? '#22252A' : 'transparent',
            color: activeTab === 'layers' ? '#00D37D' : '#B0B0B8',
            border: 'none',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Layers size={14} /> Katmanlar ({nodes.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {activeTab === 'components' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {components.map((comp) => (
              <div
                key={comp.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', comp.type);
                }}
                onClick={() => onAddComponent(comp.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#22252A',
                  borderRadius: 8,
                  border: '1px solid #383334',
                  cursor: 'grab',
                  userSelect: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#00D37D';
                  (e.currentTarget as HTMLElement).style.background = '#282C32';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#383334';
                  (e.currentTarget as HTMLElement).style.background = '#22252A';
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F5F7' }}>{comp.label}</div>
                  <div style={{ fontSize: 11, color: '#8888A0', textTransform: 'capitalize' }}>{comp.category}</div>
                </div>
                <button
                  type="button"
                  style={{
                    background: 'rgba(0,211,125,0.15)',
                    border: 'none',
                    borderRadius: 6,
                    padding: 6,
                    color: '#00D37D',
                    cursor: 'pointer',
                  }}
                  title="Əlavə et"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: isSelected ? 'rgba(0,211,125,0.15)' : '#22252A',
                    border: isSelected ? '1px solid #00D37D' : '1px solid #383334',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#00D37D' : '#F5F5F7', textTransform: 'uppercase' }}>
                    {node.type}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveNode(node.id, 'up'); }}
                      disabled={index === 0}
                      style={{ background: 'none', border: 'none', color: '#B0B0B8', cursor: 'pointer', padding: 2 }}
                      title="Yuxarı"
                    >
                      <MoveUp size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveNode(node.id, 'down'); }}
                      disabled={index === nodes.length - 1}
                      style={{ background: 'none', border: 'none', color: '#B0B0B8', cursor: 'pointer', padding: 2 }}
                      title="Aşağı"
                    >
                      <MoveDown size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicateNode(node.id); }}
                      style={{ background: 'none', border: 'none', color: '#B0B0B8', cursor: 'pointer', padding: 2 }}
                      title="Kopyasını çıxar"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                      style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 2 }}
                      title="Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
