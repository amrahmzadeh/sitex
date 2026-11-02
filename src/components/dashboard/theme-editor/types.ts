import { ThemeConfig } from '@/lib/themes';
import { STLThemeNode, STLError } from '@/modules/stl';

export type ThemeEditorTab =
  | 'builder'
  | 'code'
  | 'library'
  | 'assets'
  | 'versions'
  | 'settings';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export type ComponentTarget =
  | 'all'
  | 'header'
  | 'navigation'
  | 'buttons'
  | 'cards'
  | 'inputs'
  | 'footer'
  | 'badges';

export interface ThemeVersionRecord {
  id: string;
  version: string;
  title: string;
  note?: string;
  timestamp: number;
  author: string;
  trigger: 'auto' | 'manual' | 'code' | 'visual' | 'import' | 'publish';
  theme: ThemeConfig;
  stlCode: string;
}

export interface CustomThemeRecord {
  id: string;
  name: string;
  description?: string;
  author?: string;
  version: string;
  category?: string[];
  previewGradient?: string[];
  themeConfig: ThemeConfig;
  stlCode?: string;
  updatedAt: number;
  createdAt: number;
}

