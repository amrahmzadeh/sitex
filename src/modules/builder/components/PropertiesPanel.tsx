'use client';

import React from 'react';
import '../registry/builtinComponents';
import { BuilderNode } from '../types';
import { getComponent } from '../registry/componentRegistry';
import { Trash2, Copy, X, Sliders, RotateCcw } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: BuilderNode | null;
  onUpdateProps: (id: string, newProps: Record<string, any>) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onMoveNode: (id: string, direction: 'up' | 'down') => void;
  onClose?: () => void;
}

export function PropertiesPanel({
  selectedNode,
  onUpdateProps,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onClose,
}: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div style={{
        width: 300,
        borderLeft: '1px solid #1E232F',
        background: '#0D0F14',
        padding: 24,
        color: '#687082',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#13161F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
          color: '#8B93A7'
        }}>
          <Sliders size={20} />
        </div>
        <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: '#8B93A7' }}>Xüsusiyyətlər Paneli</p>
        <p style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5, color: '#555C6E' }}>
          Tənzimləmək üçün kətandan və ya qatlardan bir element seçin.
        </p>
      </div>
    );
  }

  const def = getComponent(selectedNode.type);
  if (!def) {
    return (
      <div style={{
        width: 300,
        borderLeft: '1px solid #1E232F',
        background: '#0D0F14',
        padding: 20,
        color: '#F87171',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Element tapılmadı</span>
          {onClose && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#8B93A7', cursor: 'pointer' }}>
              <X size={15} />
            </button>
          )}
        </div>
        <p style={{ fontSize: 12 }}>Naməlum tip: <code>{selectedNode.type}</code></p>
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          style={{
            marginTop: 12,
            padding: '6px 12px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 6,
            color: '#EF4444',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Elementi sil
        </button>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdateProps(selectedNode.id, { [key]: value });
  };

  return (
    <div style={{
      width: 300,
      borderLeft: '1px solid #1E232F',
      background: '#0D0F14',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1E232F',
        background: '#090A0D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D37D' }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#F5F5F7', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {def.label}
            </h3>
          </div>
          <span style={{ fontSize: 10, color: '#687082', fontFamily: 'monospace' }}>#{selectedNode.id.slice(0, 10)}</span>
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
              border: '1px solid rgba(239,68,68,0.2)',
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
                background: 'transparent',
                border: 'none',
                padding: '5px',
                color: '#687082',
                cursor: 'pointer',
                marginLeft: 4,
              }}
              title="Bağla"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(def.propSchema).map(([key, schema]) => {
          const val = selectedNode.props[key] !== undefined ? selectedNode.props[key] : schema.defaultValue;

          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#9DA5B4', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {schema.label}
                </label>
                {val !== schema.defaultValue && (
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
                      fontSize: 10
                    }}
                    title="İlkin dəyərə qaytar"
                  >
                    <RotateCcw size={10} />
                    <span>Sıfırla</span>
                  </button>
                )}
              </div>

              {schema.type === 'string' && (
                <input
                  type="text"
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: '#13161F',
                    border: '1px solid #1E232F',
                    borderRadius: 6,
                    color: '#E6E9F0',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              )}

              {schema.type === 'textarea' && (
                <textarea
                  rows={3}
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: '#13161F',
                    border: '1px solid #1E232F',
                    borderRadius: 6,
                    color: '#E6E9F0',
                    fontSize: 12,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              )}

              {schema.type === 'number' && (
                <input
                  type="number"
                  value={val !== undefined ? val : 0}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: '#13161F',
                    border: '1px solid #1E232F',
                    borderRadius: 6,
                    color: '#E6E9F0',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              )}

              {schema.type === 'color' && (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={val || '#000000'}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{
                      width: 32,
                      height: 32,
                      border: '1px solid #1E232F',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: 'transparent',
                      padding: 1,
                    }}
                  />
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      background: '#13161F',
                      border: '1px solid #1E232F',
                      borderRadius: 6,
                      color: '#E6E9F0',
                      fontSize: 12,
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {schema.type === 'select' && (
                <select
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: '#13161F',
                    border: '1px solid #1E232F',
                    borderRadius: 6,
                    color: '#E6E9F0',
                    fontSize: 12,
                    outline: 'none',
                  }}
                >
                  {schema.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {schema.type === 'boolean' && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '6px 10px',
                  background: '#13161F',
                  border: '1px solid #1E232F',
                  borderRadius: 6,
                }}>
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    style={{ accentColor: '#00D37D', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 12, color: '#E6E9F0' }}>Aktiv</span>
                </label>
              )}

              {schema.type === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: '#13161F',
                      border: '1px solid #1E232F',
                      borderRadius: 6,
                      color: '#E6E9F0',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  {val && (
                    <img
                      src={val}
                      alt="preview"
                      style={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: '1px solid #1E232F'
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


