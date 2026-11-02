'use client';

import React from 'react';
import { BuilderNode, DeviceMode, GlobalDesignTokens } from '../types';
import { TemplateRenderer } from '../renderer';
import '../registry/builtinComponents';

interface CanvasProps {
  nodes: BuilderNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  device: DeviceMode;
  onDropComponent: (type: string) => void;
  onOpenAddModal?: () => void;
  tokens?: GlobalDesignTokens;
  onDeleteNode?: (id: string) => void;
  onChangeNodeType?: (id: string) => void;
}

export function Canvas({
  nodes,
  selectedNodeId,
  onSelectNode,
  device,
  onDropComponent,
  onOpenAddModal,
  tokens,
  onDeleteNode,
  onChangeNodeType,
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
          'radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundColor: '#090A0D',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: device === 'desktop' ? '0' : '32px 16px',
        position: 'relative',
        boxSizing: 'border-box',
        height: '100%',
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
          minHeight: device === 'desktop' ? '100%' : '80vh',
          background: tokens?.colors?.background || '#0F1115',
          color: tokens?.colors?.text || '#F5F5F7',
          boxShadow:
            device === 'desktop'
              ? 'none'
              : '0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
          borderRadius: device === 'desktop' ? 0 : 20,
          overflow: 'hidden',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          border: device === 'desktop' ? 'none' : '8px solid #1C202A',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <TemplateRenderer
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          device={device}
          interactive={true}
          tokens={tokens}
          onDeleteNode={onDeleteNode}
          onChangeNodeType={onChangeNodeType}
          onOpenAddModal={onOpenAddModal}
        />
      </div>
    </div>
  );
}
