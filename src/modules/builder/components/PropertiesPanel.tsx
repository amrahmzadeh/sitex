'use client';

import React, { useState } from 'react';
import '../registry/builtinComponents';
import { BuilderNode } from '../types';
import { getComponent } from '../registry/componentRegistry';
import {
  Trash2,
  Copy,
  X,
  Sliders,
  RotateCcw,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Image as ImageIcon,
  Palette,
  Layout,
  FileText,
} from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: BuilderNode | null;
  onUpdateProps: (id: string, newProps: Record<string, any>) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onMoveNode: (id: string, direction: 'up' | 'down') => void;
  onClose?: () => void;
  totalNodesCount?: number;
}

export function PropertiesPanel({
  selectedNode,
  onUpdateProps,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onClose,
  totalNodesCount = 0,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout'>('content');

  // When no node is selected: Overview State
  if (!selectedNode) {
    return (
      <div
        style={{
          width: 320,
          borderLeft: '1px solid #1E232F',
          background: '#0D0F14',
          padding: 24,
          color: '#8A8F9E',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          userSelect: 'none',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'rgba(0, 211, 125, 0.08)',
            border: '1px solid rgba(0, 211, 125, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
            color: '#00D37D',
          }}
        >
          <Sliders size={22} />
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#F4F5F8' }}>İnspektor Paneli</h4>
        <p style={{ fontSize: 12, marginTop: 8, lineHeight: 1.6, textAlign: 'center', color: '#7E8494' }}>
          Tənzimləmək üçün kətandan və ya sol bölmələr siyahısından bir blok seçin.
        </p>
        <div
          style={{
            marginTop: 20,
            padding: '12px 16px',
            background: '#13151D',
            borderRadius: 10,
            border: '1px solid #20242E',
            width: '100%',
            boxSizing: 'border-box',
            fontSize: 12,
            color: '#A0A5B5',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Kətan Bölmələri:</span>
            <span style={{ fontWeight: 700, color: '#00D37D' }}>{totalNodesCount} ədəd</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>STL Versiyası:</span>
            <span style={{ fontWeight: 600, color: '#E2E5EE' }}>v2.0 Extended</span>
          </div>
        </div>
      </div>
    );
  }

  const def = getComponent(selectedNode.type);
  if (!def) {
    return (
      <div
        style={{
          width: 320,
          borderLeft: '1px solid #1E232F',
          background: '#0D0F14',
          padding: 20,
          color: '#F87171',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Naməlum Bölmə</span>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#8A8F9E', cursor: 'pointer' }}
            >
              <X size={15} />
            </button>
          )}
        </div>
        <p style={{ fontSize: 12 }}>Naməlum tip: <code>{selectedNode.type}</code></p>
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          style={{
            marginTop: 12,
            padding: '8px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 6,
            color: '#EF4444',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Bölməni Sil
        </button>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdateProps(selectedNode.id, { [key]: value });
  };

  const schemaEntries = Object.entries(def.propSchema);
  const contentProps = schemaEntries.filter(([_, s]) => s.category === 'content' || !s.category);
  const styleProps = schemaEntries.filter(([_, s]) => s.category === 'style');
  const layoutProps = schemaEntries.filter(([_, s]) => s.category === 'layout');

  const currentTabProps =
    activeTab === 'content'
      ? contentProps.length > 0
        ? contentProps
        : schemaEntries
      : activeTab === 'style'
      ? styleProps.length > 0
        ? styleProps
        : schemaEntries
      : layoutProps.length > 0
      ? layoutProps
      : schemaEntries;

  return (
    <div
      className="sitex-properties-panel"
      style={{
        width: 330,
        maxWidth: '100%',
        borderLeft: '1px solid #1E232F',
        background: '#0D0F14',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        userSelect: 'none',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1E232F',
          background: '#0A0C10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D37D' }} />
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#F5F5F7',
                margin: 0,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {def.label}
            </h3>
          </div>
          <span style={{ fontSize: 10, color: '#687082', fontFamily: 'monospace' }}>
            #{selectedNode.id}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button
            onClick={() => onDuplicateNode(selectedNode.id)}
            style={{
              background: '#151922',
              border: '1px solid #1E232F',
              borderRadius: 6,
              padding: '5px 7px',
              color: '#8B93A7',
              cursor: 'pointer',
            }}
            title="Kopyasını çıxar"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 6,
              padding: '5px 7px',
              color: '#EF4444',
              cursor: 'pointer',
            }}
            title="Sil"
          >
            <Trash2 size={13} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                borderRadius: 6,
                padding: '4px 9px',
                color: '#F4F5F8',
                cursor: 'pointer',
                marginLeft: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
              }}
              title="Paneli bağla"
            >
              <X size={13} strokeWidth={2.5} />
              <span>Bağla</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-tabs (Məzmun, Stil, Tərtibat) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderBottom: '1px solid #1E232F',
          background: '#090A0E',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          style={{
            padding: '8px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'content' ? '2px solid #00D37D' : '2px solid transparent',
            color: activeTab === 'content' ? '#00D37D' : '#8A8F9E',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <FileText size={12} />
          <span>Məzmun</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          style={{
            padding: '8px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'style' ? '2px solid #00D37D' : '2px solid transparent',
            color: activeTab === 'style' ? '#00D37D' : '#8A8F9E',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Palette size={12} />
          <span>Stil</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          style={{
            padding: '8px 0',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'layout' ? '2px solid #00D37D' : '2px solid transparent',
            color: activeTab === 'layout' ? '#00D37D' : '#8A8F9E',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Layout size={12} />
          <span>Tərtibat</span>
        </button>
      </div>

      {/* 3. Form Fields Content */}
      <div
        className="sitex-custom-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {currentTabProps.map(([key, schema]) => {
          const val =
            selectedNode.props[key] !== undefined ? selectedNode.props[key] : schema.defaultValue;

          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#A0A7B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {schema.label}
                </label>
                {val !== schema.defaultValue && schema.defaultValue !== undefined && (
                  <button
                    onClick={() => handleChange(key, schema.defaultValue)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#687082',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: 10,
                    }}
                    title="İlkin vəziyyətə qaytar"
                  >
                    <RotateCcw size={10} />
                    <span>Sıfırla</span>
                  </button>
                )}
              </div>

              {/* Textarea */}
              {schema.type === 'textarea' && (
                <textarea
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  rows={4}
                  style={{
                    background: '#13161F',
                    border: '1px solid #202532',
                    borderRadius: 8,
                    padding: '8px 10px',
                    color: '#F5F5F7',
                    fontSize: 12,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              )}

              {/* Number */}
              {schema.type === 'number' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    value={val !== undefined ? val : ''}
                    onChange={(e) => handleChange(key, Number(e.target.value))}
                    style={{
                      flex: 1,
                      background: '#13161F',
                      border: '1px solid #202532',
                      borderRadius: 8,
                      padding: '7px 10px',
                      color: '#F5F5F7',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#687082' }}>px</span>
                </div>
              )}

              {/* Select */}
              {schema.type === 'select' && schema.options && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {schema.options.map((opt) => {
                    const isOptActive = val === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChange(key, opt.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: 6,
                          background: isOptActive ? '#00D37D' : '#13161F',
                          color: isOptActive ? '#08090C' : '#9DA5B4',
                          border: isOptActive ? '1px solid #00D37D' : '1px solid #202532',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Boolean */}
              {schema.type === 'boolean' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!val}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    style={{
                      accentColor: '#00D37D',
                      width: 16,
                      height: 16,
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#E2E5EE' }}>
                    {val ? 'Aktiv / Görünür' : 'Deaktiv'}
                  </span>
                </label>
              )}

              {/* Color */}
              {schema.type === 'color' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#13161F',
                    border: '1px solid #202532',
                    borderRadius: 8,
                    padding: '4px 8px',
                  }}
                >
                  <label
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: val || '#000000',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      display: 'inline-block',
                      position: 'relative',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="color"
                      value={val || '#000000'}
                      onChange={(e) => handleChange(key, e.target.value)}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#F5F5F7',
                      fontSize: 12,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Image Input + Sample Presets */}
              {schema.type === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {val && (
                    <div
                      style={{
                        width: '100%',
                        height: 70,
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: '1px solid #202532',
                      }}
                    >
                      <img
                        src={val}
                        alt="Önizləmə"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={val || ''}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{
                      background: '#13161F',
                      border: '1px solid #202532',
                      borderRadius: 8,
                      padding: '7px 10px',
                      color: '#F5F5F7',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          key,
                          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'
                        )
                      }
                      style={{
                        padding: '3px 7px',
                        borderRadius: 4,
                        background: '#181C26',
                        border: '1px solid #242936',
                        color: '#A0A7B8',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      Restoran
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          key,
                          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
                        )
                      }
                      style={{
                        padding: '3px 7px',
                        borderRadius: 4,
                        background: '#181C26',
                        border: '1px solid #242936',
                        color: '#A0A7B8',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      Qril / Ət
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange(
                          key,
                          'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
                        )
                      }
                      style={{
                        padding: '3px 7px',
                        borderRadius: 4,
                        background: '#181C26',
                        border: '1px solid #242936',
                        color: '#A0A7B8',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      Kafe
                    </button>
                  </div>
                </div>
              )}

              {/* String (Default) */}
              {(schema.type === 'string' || !schema.type) && (
                <input
                  type="text"
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{
                    background: '#13161F',
                    border: '1px solid #202532',
                    borderRadius: 8,
                    padding: '7px 10px',
                    color: '#F5F5F7',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
