import { STLThemeNode } from './types';
import { ThemeDefinition } from '../themes/types';
import { ThemeConfig } from '@/lib/themes';

export function stringifySTL(theme: STLThemeNode): string {
  const lines: string[] = [];

  const extendsClause = theme.parentTheme ? ` extends "${theme.parentTheme}"` : '';
  lines.push(`theme "${theme.id}"${extendsClause} {`);

  // Meta
  lines.push('  meta {');
  for (const [k, v] of Object.entries(theme.meta || {})) {
    lines.push(`    ${k}: "${v}"`);
  }
  lines.push('  }\n');

  // Colors
  lines.push('  colors {');
  for (const [k, v] of Object.entries(theme.colors || {})) {
    const valStr = v.startsWith('#') || v.includes('(') ? `"${v}"` : v;
    lines.push(`    ${k}: ${valStr}`);
  }
  lines.push('  }\n');

  // Typography
  lines.push('  typography {');
  for (const [k, v] of Object.entries(theme.typography || {})) {
    const valStr = v.includes(' ') || !/^[a-zA-Z0-9_-]+$/.test(v) ? `"${v}"` : `"${v}"`;
    lines.push(`    ${k}: ${valStr}`);
  }
  lines.push('  }\n');

  // Layout
  lines.push('  layout {');
  for (const [k, v] of Object.entries(theme.layout || {})) {
    const valStr = /^[0-9]+[a-zA-Z%]+$/.test(v) ? `"${v}"` : `"${v}"`;
    lines.push(`    ${k}: ${valStr}`);
  }
  lines.push('  }\n');

  // Components
  if (theme.components && Object.keys(theme.components).length > 0) {
    lines.push('  components {');
    for (const [compName, compProps] of Object.entries(theme.components)) {
      lines.push(`    ${compName} {`);
      for (const [k, v] of Object.entries(compProps)) {
        const valStr = v.startsWith('colors.') || v.startsWith('layout.') || v.startsWith('typography.')
          ? v
          : `"${v}"`;
        lines.push(`      ${k}: ${valStr}`);
      }
      lines.push('    }\n');
    }
    lines.push('  }');
  }

  lines.push('}\n');
  return lines.join('\n');
}

export function themeConfigToSTL(config: Partial<ThemeConfig>, id = 'SiteXTheme'): string {
  const stlNode: STLThemeNode = {
    type: 'Theme',
    id: config.id || id,
    meta: {
      name: config.name || id,
      version: '1.0.0',
      author: 'SiteX User',
      description: config.description || 'SiteX ilə hazırlanmış peşəkar tema',
    },
    colors: {
      primary: config.primaryColor || '#00D37D',
      secondary: config.secondaryColor || '#1A1A2E',
      accent: config.accentColor || '#D4A574',
      background: config.backgroundColor || '#FFFFFF',
      surface: '#F8FAFC',
      text: config.textColor || '#111315',
    },
    typography: {
      heading: config.headingFont || 'Outfit',
      body: config.bodyFont || 'Inter',
      baseSize: '16px',
    },
    layout: {
      containerWidth: '1200px',
      borderRadius: config.borderRadius || '12px',
      spacing: '16px',
    },
    components: {
      button: {
        background: 'colors.primary',
        color: '#FFFFFF',
        radius: '8px',
        style: config.buttonStyle || 'solid',
      },
      card: {
        background: 'colors.surface',
        radius: config.borderRadius || '12px',
        style: config.cardStyle || 'elevated',
      },
      header: {
        style: config.headerStyle || 'glass',
      },
      footer: {
        style: config.footerStyle || 'dark',
      },
    },
    customBlocks: {},
    rawAst: [],
    loc: { line: 1, column: 1 },
  };

  return stringifySTL(stlNode);
}
