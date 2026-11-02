import { z } from 'zod';
import { STLThemeNode, STLError } from '../stl/types';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type BuilderActiveMode = 'visual' | 'code' | 'preview' | 'themes' | 'assets' | 'history';

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

export interface GlobalDesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    mutedText?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: string;
    lineHeight?: string;
  };
  layout: {
    containerWidth: string;
    borderRadius: string;
    spacing: string;
    shadowStyle: 'none' | 'soft' | 'medium' | 'strong';
  };
  header: {
    style: 'transparent' | 'solid' | 'glass' | 'sticky';
    height?: string;
  };
  footer: {
    style: 'dark' | 'light' | 'accent' | 'minimal';
  };
  components: {
    button: {
      style: 'solid' | 'outline' | 'ghost' | 'soft' | 'pill';
      radius: string;
      size: 'small' | 'medium' | 'large';
    };
    card: {
      style: 'elevated' | 'flat' | 'bordered';
      radius: string;
      padding: string;
    };
    input: {
      radius: string;
      borderStyle: 'solid' | 'subtle' | 'pill';
    };
    badge: {
      radius: string;
    };
  };
}

export interface ThemeVersionSnapshot {
  id: string;
  version: string;
  createdAt: string;
  note: string;
  stlCode: string;
  doc: BuilderTemplateDocument;
}

export interface BuilderTemplateDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  tokens: Record<string, any>;
  designTokens?: GlobalDesignTokens;
  nodes: BuilderNode[];
  stlCode?: string;
  updatedAt: string;
}
