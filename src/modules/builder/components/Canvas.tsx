'use client';

import React from 'react';
import { BuilderNode, DeviceMode } from '../types';
import { TemplateRenderer } from '../renderer';
import '../registry/builtinComponents';
import { Plus, Layout } from 'lucide-react';

interface CanvasProps {
  nodes: BuilderNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  device: DeviceMode;
  onDropComponent: (type: string) => void;
  onOpenAddModal?: () => void;
}

export function Canvas({
  nodes,
  selectedNodeId,
  onSelectNode,
  device,
  onDropComponent,
  onOpenAddModal,
}: CanvasProps) {
  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 768;
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundImage:
          'radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundColor: '#08090C',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: device === 'desktop' ? '0' : '32px 16px',
        position: 'relative',
      }}
      onClick={() => onSelectNode('')}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (type) {
          onDropComponent(type);
        }
      }}
    >
      <div
        style={{
          width: getDeviceWidth(),
          minHeight: device === 'desktop' ? '100%' : '85vh',
          background: '#0F1115',
          boxShadow:
            device === 'desktop'
              ? 'none'
              : '0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
          borderRadius: device === 'desktop' ? 0 : 20,
          overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          border: device === 'desktop' ? 'none' : '6px solid #1E222A',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {nodes.length === 0 ? (
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(0,211,125,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00D37D',
              }}
            >
              <Layout size={24} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F4F4F6', margin: 0 }}>
              Kətan boşdur
            </h3>
            <p style={{ fontSize: 13, color: '#8888A0', maxWidth: 360, margin: 0 }}>
              Saytınızı qurmağa başlamaq üçün ilk bölməni əlavə edin və ya komponentləri bura
              sürükləyin.
            </p>
            {onOpenAddModal && (
              <button
                type="button"
                onClick={onOpenAddModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 8,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#00D37D',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: 12,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                Bölmə Əlavə Et
              </button>
            )}
          </div>
        ) : (
          <TemplateRenderer
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            device={device}
            interactive={true}
          />
        )}
      </div>
    </div>
  );
}
