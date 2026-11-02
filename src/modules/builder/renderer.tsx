'use client';

import React, { useState } from 'react';
import { BuilderNode, DeviceMode, GlobalDesignTokens } from './types';
import { getComponent } from './registry/componentRegistry';
import './registry/builtinComponents';
import {
  AlertCircle,
  Trash2,
  RefreshCw,
  Plus,
  Layers,
  ChevronUp,
  ChevronDown,
  Copy,
  Sliders,
} from 'lucide-react';

export interface TemplateRendererProps {
  nodes: BuilderNode[];
  selectedNodeId?: string | null;
  onSelectNode?: (id: string) => void;
  device?: DeviceMode;
  interactive?: boolean;
  tokens?: GlobalDesignTokens;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
  onChangeNodeType?: (id: string) => void;
  onOpenAddModal?: () => void;
  onInsertAtIndex?: (index: number) => void;
}

export function TemplateRenderer({
  nodes,
  selectedNodeId,
  onSelectNode,
  device = 'desktop',
  interactive = false,
  tokens,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onChangeNodeType,
  onOpenAddModal,
  onInsertAtIndex,
}: TemplateRendererProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredDividerIndex, setHoveredDividerIndex] = useState<number | null>(null);

  // Empty state when there are 0 nodes
  if (!nodes || nodes.length === 0) {
    return (
      <div
        style={{
          padding: '80px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          minHeight: 420,
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'rgba(0, 211, 125, 0.1)',
            border: '1px solid rgba(0, 211, 125, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00D37D',
            boxShadow: '0 8px 24px rgba(0, 211, 125, 0.15)',
          }}
        >
          <Layers size={30} />
        </div>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#F4F5F8', margin: '0 0 6px' }}>
            Hələlik heç bir bölmə əlavə edilməyib
          </h3>
          <p style={{ fontSize: 13, color: '#888D9E', margin: 0, maxWidth: 400, lineHeight: 1.6 }}>
            Sol paneldən və ya aşağıdakı düymədən istifadə edərək saytınıza ilk blokunuzu əlavə edin.
          </p>
        </div>
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              borderRadius: 10,
              background: '#00D37D',
              color: '#08090C',
              border: 'none',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 211, 125, 0.3)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Plus size={16} strokeWidth={3} />
            <span>İlk Bölməni Əlavə Et</span>
          </button>
        )}
      </div>
    );
  }

  const renderInsertDivider = (index: number) => {
    if (!interactive || !onInsertAtIndex) return null;
    const isHovered = hoveredDividerIndex === index;

    return (
      <div
        key={`divider-${index}`}
        onMouseEnter={() => setHoveredDividerIndex(index)}
        onMouseLeave={() => setHoveredDividerIndex(null)}
        style={{
          position: 'relative',
          height: 14,
          margin: '-7px 0',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onInsertAtIndex(index);
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: isHovered ? '#00D37D' : 'transparent',
            transition: 'background 0.15s ease',
          }}
        />
        {isHovered && (
          <div
            style={{
              position: 'relative',
              background: '#00D37D',
              color: '#08090C',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 8px rgba(0, 211, 125, 0.4)',
              transform: 'scale(1)',
              transition: 'transform 0.1s ease',
            }}
          >
            <Plus size={11} strokeWidth={3} />
            <span>Bölmə Əlavə Et</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`template-renderer-container device-${device}`}
      style={{
        width: '100%',
        minHeight: '100%',
        position: 'relative',
        fontFamily: tokens?.typography?.bodyFont ? `'${tokens.typography.bodyFont}', sans-serif` : 'inherit',
      }}
    >
      {nodes.map((node, index) => {
        const def = getComponent(node.type);
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

        // Fallback placeholder for unknown types
        if (!def) {
          return (
            <React.Fragment key={node.id}>
              {index === 0 && renderInsertDivider(0)}
              <div
                onClick={(e) => {
                  if (interactive && onSelectNode) {
                    e.stopPropagation();
                    onSelectNode(node.id);
                  }
                }}
                style={{
                  margin: '12px 16px',
                  padding: '20px 24px',
                  borderRadius: 10,
                  border: '1px dashed #3A3F4E',
                  background: '#13151C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  color: '#C2C5D1',
                  fontSize: 13,
                  outline: interactive && isSelected ? '2px solid #00D37D' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8A8F9E',
                    }}
                  >
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#E2E5EE' }}>
                      Naməlum bölmə tipi: <code style={{ color: '#FBBF24' }}>{node.type}</code>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {onChangeNodeType && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeNodeType(node.id);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: '#1D212B',
                        border: '1px solid #2B3140',
                        color: '#E0E3EB',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCw size={12} />
                      <span>Dəyiş</span>
                    </button>
                  )}
                  {onDeleteNode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNode(node.id);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 6,
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.25)',
                        color: '#F87171',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Sil</span>
                    </button>
                  )}
                </div>
              </div>
              {renderInsertDivider(index + 1)}
            </React.Fragment>
          );
        }

        const Component = def.render;

        return (
          <React.Fragment key={node.id}>
            {index === 0 && renderInsertDivider(0)}

            <div
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={(e) => {
                if (interactive && onSelectNode) {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }
              }}
              style={{
                position: 'relative',
                outline:
                  interactive && isSelected
                    ? '2px solid #00D37D'
                    : interactive && isHovered
                    ? '1.5px dashed rgba(0, 211, 125, 0.6)'
                    : 'none',
                outlineOffset: -2,
                cursor: interactive ? 'pointer' : 'default',
                transition: 'outline 0.15s ease',
              }}
            >
              {/* Floating Action Toolbar on Selected / Hovered */}
              {interactive && (isSelected || isHovered) && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 12,
                    zIndex: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: '#0D0F14',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    borderRadius: 8,
                    padding: '3px 6px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: isSelected ? '#00D37D' : '#C2C5D1',
                      padding: '2px 6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      borderRight: '1px solid #242936',
                      marginRight: 2,
                    }}
                  >
                    {def.label}
                  </span>

                  {onMoveNode && (
                    <>
                      <button
                        type="button"
                        onClick={() => onMoveNode(node.id, 'up')}
                        disabled={index === 0}
                        title="Yuxarı daşı"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: index === 0 ? '#444' : '#C2C5D1',
                          padding: '3px 5px',
                          cursor: index === 0 ? 'default' : 'pointer',
                          borderRadius: 4,
                        }}
                      >
                        <ChevronUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveNode(node.id, 'down')}
                        disabled={index === nodes.length - 1}
                        title="Aşağı daşı"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: index === nodes.length - 1 ? '#444' : '#C2C5D1',
                          padding: '3px 5px',
                          cursor: index === nodes.length - 1 ? 'default' : 'pointer',
                          borderRadius: 4,
                        }}
                      >
                        <ChevronDown size={13} />
                      </button>
                    </>
                  )}

                  {onDuplicateNode && (
                    <button
                      type="button"
                      onClick={() => onDuplicateNode(node.id)}
                      title="Kopyasını çıxar"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#C2C5D1',
                        padding: '3px 5px',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                    >
                      <Copy size={12} />
                    </button>
                  )}

                  {onSelectNode && (
                    <button
                      type="button"
                      onClick={() => onSelectNode(node.id)}
                      title="Xüsusiyyətlərini aç"
                      style={{
                        background: isSelected ? 'rgba(0, 211, 125, 0.15)' : 'transparent',
                        border: 'none',
                        color: isSelected ? '#00D37D' : '#C2C5D1',
                        padding: '3px 5px',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                    >
                      <Sliders size={12} />
                    </button>
                  )}

                  {onDeleteNode && (
                    <button
                      type="button"
                      onClick={() => onDeleteNode(node.id)}
                      title="Bölməni sil"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#F87171',
                        padding: '3px 5px',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Tag indicator on Top-Left */}
              {interactive && isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: '#00D37D',
                    color: '#08090C',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '0 0 6px 0',
                    zIndex: 20,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {def.label}
                </div>
              )}

              <Component node={node} isSelected={isSelected} device={device} tokens={tokens} />
            </div>

            {renderInsertDivider(index + 1)}
          </React.Fragment>
        );
      })}
    </div>
  );
}
