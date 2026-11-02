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
  onDropComponent: (type: string, index?: number) => void;
  onOpenAddModal?: () => void;
  tokens?: GlobalDesignTokens;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
  onChangeNodeType?: (id: string) => void;
  onInsertAtIndex?: (index: number) => void;
  zoom?: number;
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
  onDuplicateNode,
  onMoveNode,
  onChangeNodeType,
  onInsertAtIndex,
  zoom = 1,
}: CanvasProps) {
  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return 390;
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
        backgroundSize: '24px 24px',
        backgroundColor: '#090A0D',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: device === 'desktop' ? '0' : '40px 24px',
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
          maxWidth: '100%',
          minHeight: device === 'desktop' ? '100%' : '84vh',
          background: tokens?.colors?.background || '#0F1115',
          color: tokens?.colors?.text || '#F5F5F7',
          boxShadow:
            device === 'desktop'
              ? 'none'
              : '0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
          borderRadius: device === 'desktop' ? 0 : 24,
          overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          border: device === 'desktop' ? 'none' : '10px solid #1C202B',
          boxSizing: 'border-box',
          transform: zoom !== 1 ? `scale(${zoom})` : 'none',
          transformOrigin: 'top center',
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
          onDuplicateNode={onDuplicateNode}
          onMoveNode={onMoveNode}
          onChangeNodeType={onChangeNodeType}
          onOpenAddModal={onOpenAddModal}
          onInsertAtIndex={onInsertAtIndex}
        />
      </div>
    </div>
  );
}
