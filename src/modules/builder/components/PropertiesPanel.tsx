'use client';

import React from 'react';
import { BuilderNode } from '../types';
import { getComponent } from '../registry/componentRegistry';
import { Trash2, Copy, MoveUp, MoveDown } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: BuilderNode | null;
  onUpdateProps: (id: string, newProps: Record<string, any>) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onMoveNode: (id: string, direction: 'up' | 'down') => void;
}

export function PropertiesPanel({
  selectedNode,
  onUpdateProps,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
}: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div style={{ width: 320, borderLeft: '1px solid #383334', background: '#181B1E', padding: 20, color: '#8888A0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, marginTop: 40 }}>Redaktə etmək üçün kətandan və ya katmanlardan bir element seçin.</p>
      </div>
    );
  }

  const def = getComponent(selectedNode.type);
  if (!def) {
    return (
      <div style={{ width: 320, borderLeft: '1px solid #383334', background: '#181B1E', padding: 20, color: '#F87171' }}>
        Element sxemi tapılmadı: {selectedNode.type}
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onUpdateProps(selectedNode.id, { [key]: value });
  };

  return (
    <div style={{ width: 320, borderLeft: '1px solid #383334', background: '#181B1E', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #383334', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>{def.label}</h3>
          <span style={{ fontSize: 11, color: '#8888A0', textTransform: 'uppercase' }}>ID: {selectedNode.id}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onDuplicateNode(selectedNode.id)}
            style={{ background: '#282C32', border: 'none', borderRadius: 6, padding: 6, color: '#E2E2E5', cursor: 'pointer' }}
            title="Kopyasını çıxar"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => onDeleteNode(selectedNode.id)}
            style={{ background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 6, padding: 6, color: '#EF4444', cursor: 'pointer' }}
            title="Sil"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Object.entries(def.propSchema).map(([key, schema]) => {
          const val = selectedNode.props[key] !== undefined ? selectedNode.props[key] : schema.defaultValue;

          return (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#B0B0B8', marginBottom: 6 }}>
                {schema.label}
              </label>

              {schema.type === 'string' && (
                <input
                  type="text"
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#121416', border: '1px solid #383334', borderRadius: 6, color: '#FFF', fontSize: 13 }}
                />
              )}

              {schema.type === 'textarea' && (
                <textarea
                  rows={3}
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#121416', border: '1px solid #383334', borderRadius: 6, color: '#FFF', fontSize: 13, resize: 'vertical' }}
                />
              )}

              {schema.type === 'number' && (
                <input
                  type="number"
                  value={val !== undefined ? val : 0}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  style={{ width: '100%', padding: '8px 12px', background: '#121416', border: '1px solid #383334', borderRadius: 6, color: '#FFF', fontSize: 13 }}
                />
              )}

              {schema.type === 'color' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={val || '#000000'}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', background: '#121416', border: '1px solid #383334', borderRadius: 6, color: '#FFF', fontSize: 13 }}
                  />
                </div>
              )}

              {schema.type === 'select' && (
                <select
                  value={val || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#121416', border: '1px solid #383334', borderRadius: 6, color: '#FFF', fontSize: 13 }}
                >
                  {schema.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {schema.type === 'boolean' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 13, color: '#F5F5F7' }}>Aktiv et</span>
                </label>
              )}

              {schema.type === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    type="text"
                    value={val || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '8px 12px', background: '#121416', border: '1px solid #383334', borderRadius: 6, color: '#FFF', fontSize: 13 }}
                  />
                  {val && (
                    <img
                      src={val}
                      alt="preview"
                      style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #383334' }}
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

