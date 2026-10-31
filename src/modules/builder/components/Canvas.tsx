'use client';

import React from 'react';
import { BuilderNode, DeviceMode } from '../types';
import { TemplateRenderer } from '../renderer';

interface CanvasProps {
  nodes: BuilderNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  device: DeviceMode;
  onDropComponent: (type: string) => void;
}

export function Canvas({
  nodes,
  selectedNodeId,
  onSelectNode,
  device,
  onDropComponent,
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
        background: '#0F1012',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px',
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
          minHeight: '80vh',
          background: '#121416',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          borderRadius: device === 'desktop' ? 0 : 16,
          overflow: 'hidden',
          transition: 'width 0.25s ease',
          border: device === 'desktop' ? 'none' : '4px solid #282C32',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {nodes.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              color: '#8888A0',
              border: '2px dashed #383334',
              margin: 20,
              borderRadius: 12,
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 600, color: '#E2E2E5' }}>Kətan boşdur</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>
              Soldakı paneldən istədiyiniz elementi buraya sürükləyin və ya klikləyin
            </p>
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
