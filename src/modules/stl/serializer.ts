import { STLThemeNode } from './types';
import { ThemeDefinition } from '../themes/types';
import { ThemeConfig } from '@/lib/themes';

export function stringifySTL(theme: STLThemeNode): string {
  const lines: string[] = [];

  // Top Comments
  if (theme.comments && theme.comments.length > 0) {
    theme.comments.forEach((c) => {
      if (c.type === 'line') {
        lines.push(`// ${c.text}`);
      } else {
        lines.push(`/* ${c.text} */`);
      }
    });
    lines.push('');
  }

  // Top Imports
  if (theme.imports && theme.imports.length > 0) {
    theme.imports.forEach((imp) => {
      lines.push(`import "${imp}"`);
    });
    lines.push('');
  }

  const extendsClause = theme.parentTheme ? ` extends "${theme.parentTheme}"` : '';
  lines.push(`theme "${theme.id}"${extendsClause} {`);

  const formatValue = (v: string): string => {
    if (!v) return '""';
    const trimmed = v.trim();
    if (
      trimmed.startsWith('colors.') ||
      trimmed.startsWith('typography.') ||
      trimmed.startsWith('layout.') ||
      trimmed.startsWith('tokens.') ||
      trimmed.startsWith('lighten(') ||
      trimmed.startsWith('darken(') ||
      trimmed.startsWith('alpha(') ||
      trimmed.startsWith('mix(')
    ) {
      return trimmed;
    }
    // If already quoted
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed;
    }
    return `"${trimmed}"`;
  };

  // 1. Meta
  if (theme.meta && Object.keys(theme.meta).length > 0) {
    lines.push('  meta {');
    for (const [k, v] of Object.entries(theme.meta)) {
      lines.push(`    ${k}: "${v}"`);
    }
    lines.push('  }\n');
  }

  // 2. Colors
  if (theme.colors && Object.keys(theme.colors).length > 0) {
    lines.push('  colors {');
    for (const [k, v] of Object.entries(theme.colors)) {
      lines.push(`    ${k}: ${formatValue(v)}`);
    }
    lines.push('  }\n');
  }

  // 3. Typography
  if (theme.typography && Object.keys(theme.typography).length > 0) {
    lines.push('  typography {');
    for (const [k, v] of Object.entries(theme.typography)) {
      lines.push(`    ${k}: "${v}"`);
    }
    lines.push('  }\n');
  }

  // 4. Layout
  if (theme.layout && Object.keys(theme.layout).length > 0) {
    lines.push('  layout {');
    for (const [k, v] of Object.entries(theme.layout)) {
      lines.push(`    ${k}: "${v}"`);
    }
    lines.push('  }\n');
  }

  // 5. Tokens
  if (theme.tokens && Object.keys(theme.tokens).length > 0) {
    lines.push('  tokens {');
    for (const [catName, catProps] of Object.entries(theme.tokens)) {
      lines.push(`    ${catName} {`);
      for (const [k, v] of Object.entries(catProps)) {
        lines.push(`      ${k}: ${formatValue(v)}`);
      }
      lines.push('    }\n');
    }
    lines.push('  }\n');
  }

  // 6. Modes (Light / Dark)
  if (theme.modes && Object.keys(theme.modes).length > 0) {
    lines.push('  modes {');
    for (const [modeName, modeObj] of Object.entries(theme.modes)) {
      lines.push(`    ${modeName} {`);
      for (const [subKey, subVal] of Object.entries(modeObj)) {
        if (typeof subVal === 'object' && subVal !== null) {
          lines.push(`      ${subKey} {`);
          for (const [k, v] of Object.entries(subVal as Record<string, string>)) {
            lines.push(`        ${k}: ${formatValue(v)}`);
          }
          lines.push('      }\n');
        } else {
          lines.push(`      ${subKey}: ${formatValue(String(subVal))}`);
        }
      }
      lines.push('    }\n');
    }
    lines.push('  }\n');
  }

  // 7. Responsive
  if (theme.responsive && Object.keys(theme.responsive).length > 0) {
    lines.push('  responsive {');
    for (const [bpName, bpObj] of Object.entries(theme.responsive)) {
      lines.push(`    ${bpName} {`);
      for (const [subKey, subVal] of Object.entries(bpObj)) {
        if (typeof subVal === 'object' && subVal !== null) {
          lines.push(`      ${subKey} {`);
          for (const [k, v] of Object.entries(subVal as Record<string, string>)) {
            lines.push(`        ${k}: ${formatValue(v)}`);
          }
          lines.push('      }\n');
        } else {
          lines.push(`      ${subKey}: ${formatValue(String(subVal))}`);
        }
      }
      lines.push('    }\n');
    }
    lines.push('  }\n');
  }

  // 8. Components
  if (theme.components && Object.keys(theme.components).length > 0) {
    lines.push('  components {');
    for (const [compName, compProps] of Object.entries(theme.components)) {
      lines.push(`    ${compName} {`);
      for (const [k, v] of Object.entries(compProps)) {
        lines.push(`      ${k}: ${formatValue(v)}`);
      }
      lines.push('    }\n');
    }
    lines.push('  }');
  }

  lines.push('}\n');
  return lines.join('\n');
}

export function themeConfigToSTL(config: Partial<ThemeConfig>, id = 'SiteXTheme'): string {
  const colorsObj: Record<string, string> = {
    primary: config.primaryColor || '#00D37D',
    secondary: config.secondaryColor || '#1A1A2E',
    accent: config.accentColor || '#D4A574',
    background: config.backgroundColor || '#FFFFFF',
    surface: '#F8FAFC',
    text: config.textColor || '#111315',
  };

  if (config.whatsappColor) colorsObj.whatsapp = config.whatsappColor;
  if (config.whatsappIconColor) colorsObj.whatsappIcon = config.whatsappIconColor;
  if (config.navbarBgColor) colorsObj.navbarBg = config.navbarBgColor;
  if (config.siteBgColor) colorsObj.siteBg = config.siteBgColor;
  if (config.footerBgColor) colorsObj.footerBg = config.footerBgColor;
  if (config.formBgColor) colorsObj.formBg = config.formBgColor;
  if (config.navbarGradientFrom) colorsObj.navbarGradientFrom = config.navbarGradientFrom;
  if (config.navbarGradientTo) colorsObj.navbarGradientTo = config.navbarGradientTo;
  if (config.siteGradientFrom) colorsObj.siteGradientFrom = config.siteGradientFrom;
  if (config.siteGradientTo) colorsObj.siteGradientTo = config.siteGradientTo;
  if (config.footerGradientFrom) colorsObj.footerGradientFrom = config.footerGradientFrom;
  if (config.footerGradientTo) colorsObj.footerGradientTo = config.footerGradientTo;

  const typoObj: Record<string, string> = {
    heading: config.headingFont || 'Outfit',
    body: config.bodyFont || 'Inter',
    baseSize: '16px',
  };
  if (config.brandFont) typoObj.brandFont = config.brandFont;

  const layoutObj: Record<string, string> = {
    containerWidth: '1200px',
    borderRadius: config.borderRadius || '12px',
    spacing: '16px',
    heroHeight: config.heroHeight || '85vh',
  };
  if (config.heroOverlay !== undefined) layoutObj.heroOverlay = String(config.heroOverlay);
  if (config.headerStyle) layoutObj.headerStyle = config.headerStyle;
  if (config.footerStyle) layoutObj.footerStyle = config.footerStyle;
  if (config.buttonStyle) layoutObj.buttonStyle = config.buttonStyle;
  if (config.cardStyle) layoutObj.cardStyle = config.cardStyle;
  if (config.navbarBgType) layoutObj.navbarBgType = config.navbarBgType;
  if (config.siteBgType) layoutObj.siteBgType = config.siteBgType;
  if (config.footerBgType) layoutObj.footerBgType = config.footerBgType;
  if (config.formBgType) layoutObj.formBgType = config.formBgType;

  const componentsObj: Record<string, Record<string, string>> = {
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
      style: config.headerStyle || 'transparent',
    },
    footer: {
      style: config.footerStyle || 'dark',
    },
  };

  const stlNode: STLThemeNode = {
    type: 'Theme',
    id: config.id || id,
    meta: {
      name: config.name || id,
      version: '1.0.0',
      author: 'SiteX User',
      description: config.description || 'SiteX ilə hazırlanmış peşəkar tema',
    },
    colors: colorsObj,
    typography: typoObj,
    layout: layoutObj,
    components: componentsObj,
    customBlocks: {},
    rawAst: [],
    loc: { line: 1, column: 1 },
  };

  return stringifySTL(stlNode);
}
