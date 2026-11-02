'use client';

import React, { useState } from 'react';
import '../registry/builtinComponents';
import { listComponents } from '../registry/componentRegistry';
import { BuilderNode } from '../types';
import { Layers, Plus, MoveUp, MoveDown, Copy, Trash2, Search, Box, Sparkles } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const components = listComponents();

  const filteredComponents = components.filter(c => 
    c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      width: 280,
      borderRight: '1px solid #1E232F',
      display: 'flex',
      flexDirection: 'column',
      background: '#0D0F14',
      userSelect: 'none',
      flexShrink: 0
    }}>
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        padding: '8px 10px',
        gap: 6,
        borderBottom: '1px solid #1E232F',
        background: '#090A0D'
      }}>
        <button
          onClick={() => setActiveTab('components')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 10px',
            borderRadius: 7,
            background: activeTab === 'components' ? '#181C26' : 'transparent',
            color: activeTab === 'components' ? '#00D37D' : '#8B93A7',
            border: activeTab === 'components' ? '1px solid rgba(0, 211, 125, 0.25)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Box size={13} />
          <span>Komponentlər</span>
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '7px 10px',
            borderRadius: 7,
            background: activeTab === 'layers' ? '#181C26' : 'transparent',
            color: activeTab === 'layers' ? '#00D37D' : '#8B93A7',
            border: activeTab === 'layers' ? '1px solid rgba(0, 211, 125, 0.25)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={13} />
          <span>Qatlar</span>
          <span style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 999,
            background: activeTab === 'layers' ? 'rgba(0, 211, 125, 0.2)' : '#1E232F',
            color: activeTab === 'layers' ? '#00D37D' : '#8B93A7',
            fontWeight: 700
          }}>
            {nodes.length}
          </span>
        </button>
      </div>

      {/* Search Input when in Components tab */}
      {activeTab === 'components' && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #161A22' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={13} style={{ position: 'absolute', left: 9, color: '#687082', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Komponent axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 28px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #1E232F',
                background: '#13161F',
                color: '#E6E9F0',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {activeTab === 'components' ? (
          filteredComponents.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: '#687082', fontSize: 12 }}>
              Uyğun komponent tapılmadı
            </div>
          ) : (
            filteredComponents.map((comp) => (
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
                  padding: '9px 12px',
                  background: '#12151D',
                  borderRadius: 8,
                  border: '1px solid #1A1F2B',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00D37D';
                  e.currentTarget.style.background = '#171B26';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1A1F2B';
                  e.currentTarget.style.background = '#12151D';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#E6E9F0' }}>{comp.label}</div>
                  <div style={{ fontSize: 10, color: '#747D92', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{comp.category}</div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: 'rgba(0, 211, 125, 0.1)',
                    color: '#00D37D',
                  }}
                >
                  <Plus size={13} />
                </div>
              </div>
            ))
          )
        ) : (
          nodes.length === 0 ? (
            <div style={{ padding: '30px 12px', textAlign: 'center', color: '#687082', fontSize: 12 }}>
              Kətanda heç bir element yoxdur. Komponentlər panelindən əlavə edin.
            </div>
          ) : (
            nodes.map((node, index) => {
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
                    borderRadius: 7,
                    background: isSelected ? 'rgba(0, 211, 125, 0.12)' : '#12151D',
                    border: isSelected ? '1px solid #00D37D' : '1px solid #1A1F2B',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isSelected ? '#00D37D' : '#394050'
                    }} />
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected ? '#00D37D' : '#E6E9F0',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {node.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveNode(node.id, 'up'); }}
                      disabled={index === 0}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: index === 0 ? '#313745' : '#8B93A7',
                        cursor: index === 0 ? 'default' : 'pointer',
                        padding: 3,
                        borderRadius: 4,
                      }}
                      title="Yuxarı daşı"
                    >
                      <MoveUp size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveNode(node.id, 'down'); }}
                      disabled={index === nodes.length - 1}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: index === nodes.length - 1 ? '#313745' : '#8B93A7',
                        cursor: index === nodes.length - 1 ? 'default' : 'pointer',
                        padding: 3,
                        borderRadius: 4,
                      }}
                      title="Aşağı daşı"
                    >
                      <MoveDown size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDuplicateNode(node.id); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8B93A7',
                        cursor: 'pointer',
                        padding: 3,
                        borderRadius: 4,
                      }}
                      title="Kopyasını çıxar"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: 3,
                        borderRadius: 4,
                      }}
                      title="Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}


