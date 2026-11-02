'use client';

import React from 'react';
import { BuilderNode, DeviceMode, GlobalDesignTokens } from './types';
import { getComponent } from './registry/componentRegistry';
import './registry/builtinComponents';
import { AlertCircle, Trash2, RefreshCw, Plus, Layers } from 'lucide-react';

export interface TemplateRendererProps {
  nodes: BuilderNode[];
  selectedNodeId?: string | null;
  onSelectNode?: (id: string) => void;
  device?: DeviceMode;
  interactive?: boolean;
  tokens?: GlobalDesignTokens;
  onDeleteNode?: (id: string) => void;
  onChangeNodeType?: (id: string) => void;
  onOpenAddModal?: () => void;
}

export function TemplateRenderer({
  nodes,
  selectedNodeId,
  onSelectNode,
  device = 'desktop',
  interactive = false,
  tokens,
  onDeleteNode,
  onChangeNodeType,
  onOpenAddModal,
}: TemplateRendererProps) {
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
          minHeight: 360,
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'rgba(0, 211, 125, 0.08)',
            border: '1px solid rgba(0, 211, 125, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00D37D',
          }}
        >
          <Layers size={26} />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F4F5F8', margin: '0 0 6px' }}>
            Hələlik heç bir bölmə əlavə edilməyib
          </h3>
          <p style={{ fontSize: 13, color: '#888D9E', margin: 0, maxWidth: 360 }}>
            Saytınızı formalaşdırmaq üçün ilk blokunuzu seçin və ya şablonu başladın.
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
              padding: '10px 18px',
              borderRadius: 8,
              background: '#00D37D',
              color: '#08090C',
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 211, 125, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Plus size={15} strokeWidth={3} />
            <span>Bölmə əlavə et</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`template-renderer-container device-${device}`}
      style={{
        width: '100%',
        minHeight: '100%',
        fontFamily: tokens?.typography?.bodyFont ? `'${tokens.typography.bodyFont}', sans-serif` : 'inherit',
      }}
    >
      {nodes.map((node) => {
        const def = getComponent(node.type);
        const isSelected = selectedNodeId === node.id;

        // Neutral dashed placeholder for genuinely unknown types
        if (!def) {
          return (
            <div
              key={node.id}
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
                    Bu bölüm tipi dəstəklənmir: <code style={{ color: '#FBBF24' }}>{node.type}</code>
                  </div>
                  <div style={{ fontSize: 11, color: '#7E8494', marginTop: 2 }}>
                    Komponent qeydiyyatdan keçməyib və ya adı səhv daxil edilib.
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
                    <span>Tipi dəyişdir</span>
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
          );
        }

        const Component = def.render;

        return (
          <div
            key={node.id}
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
                  : interactive
                  ? '1px dashed transparent'
                  : 'none',
              outlineOffset: -2,
              cursor: interactive ? 'pointer' : 'default',
              transition: 'outline 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (interactive && !isSelected) {
                (e.currentTarget as HTMLElement).style.outline = '1px dashed rgba(0, 211, 125, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (interactive && !isSelected) {
                (e.currentTarget as HTMLElement).style.outline = '1px dashed transparent';
              }
            }}
          >
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
                  padding: '2px 8px',
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
        );
      })}
    </div>
  );
}
