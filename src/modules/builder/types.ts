import { z } from 'zod';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface ComponentPropSchema {
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'image' | 'textarea';
  label: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  category?: 'content' | 'style' | 'layout';
}

export interface BuilderNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: BuilderNode[];
  styleOverrides?: {
    mobile?: Record<string, any>;
    tablet?: Record<string, any>;
    desktop?: Record<string, any>;
  };
}

export interface ComponentDefinition {
  type: string;
  label: string;
  icon: string;
  category: 'layout' | 'typography' | 'media' | 'content' | 'form';
  defaultProps: Record<string, any>;
  propSchema: Record<string, ComponentPropSchema>;
  render: React.ComponentType<{ node: BuilderNode; isSelected?: boolean; device?: DeviceMode }>;
}

export interface BuilderTemplateDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  tokens: Record<string, any>;
  nodes: BuilderNode[];
  updatedAt: string;
}

