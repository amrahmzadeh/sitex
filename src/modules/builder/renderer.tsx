'use client';

import React from 'react';
import { BuilderNode, DeviceMode } from './types';
import { getComponent } from './registry/componentRegistry';

interface TemplateRendererProps {
  nodes: BuilderNode[];
  selectedNodeId?: string | null;
  onSelectNode?: (id: string) => void;
  device?: DeviceMode;
  interactive?: boolean;
}

export function TemplateRenderer({
  nodes,
  selectedNodeId,
  onSelectNode,
  device = 'desktop',
  interactive = false,
}: TemplateRendererProps) {
  return (
    <div className={`template-renderer-container device-${device}`} style={{ width: '100%', minHeight: '100%' }}>
      {nodes.map((node) => {
        const def = getComponent(node.type);
        if (!def) {
          return (
            <div key={node.id} style={{ padding: 16, background: '#2B1515', color: '#F87171', fontSize: 13 }}>
              Naməlum komponent: {node.type}
            </div>
          );
        }

        const isSelected = selectedNodeId === node.id;
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
              outline: interactive && isSelected ? '2px solid #00D37D' : interactive ? '1px dashed transparent' : 'none',
              outlineOffset: -2,
              cursor: interactive ? 'pointer' : 'default',
              transition: 'outline 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (interactive && !isSelected) {
                (e.currentTarget as HTMLElement).style.outline = '1px dashed rgba(0,211,125,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (interactive && !isSelected) {
                (e.currentTarget as HTMLElement).style.outline = '1px dashed transparent';
              }
            }}
          >
            <Component node={node} isSelected={isSelected} device={device} />
          </div>
        );
      })}
    </div>
  );
}

