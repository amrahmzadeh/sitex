import { STLThemeNode, STLCompilationResult, STLError } from './types';
import { ThemeDefinition, ThemeTokens } from '../themes/types';
import { getTheme } from '../themes/registry';
import { validateSTLTheme } from './validator';

export function compileSTL(themeNode: STLThemeNode): STLCompilationResult {
  const errors: STLError[] = [];

  // Validation
  const validationErrors = validateSTLTheme(themeNode);
  errors.push(...validationErrors);

  // Inherit if parentTheme is specified
  let baseColors: Record<string, string> = {
    primary: '#00D37D',
    secondary: '#1A1A2E',
    accent: '#D4A574',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#111315',
  };

  let baseTypography: Record<string, string> = {
    heading: 'Outfit',
    body: 'Inter',
    baseSize: '16px',
  };

  let baseLayout: Record<string, string> = {
    containerWidth: '1200px',
    borderRadius: '12px',
    spacing: '16px',
  };

  let baseComponents: Record<string, Record<string, string>> = {
    button: {
      background: 'colors.primary',
      color: '#000000',
      radius: '8px',
      padding: '10px 20px',
    },
    card: {
      background: 'colors.surface',
      radius: '12px',
      shadow: '0 4px 16px rgba(0,0,0,0.06)',
      padding: '20px',
    },
  };

  if (themeNode.parentTheme) {
    const parent = getTheme(themeNode.parentTheme);
    if (parent) {
      baseColors = {
        primary: parent.tokens.colors.primary,
        secondary: parent.tokens.colors.secondary,
        accent: parent.tokens.colors.accent,
        background: parent.tokens.colors.background,
        text: parent.tokens.colors.text,
        surface: parent.tokens.colors.background,
      };
      baseTypography = {
        heading: parent.tokens.typography.headingFont,
        body: parent.tokens.typography.bodyFont,
        baseSize: '16px',
      };
      baseLayout = {
        containerWidth: '1200px',
        borderRadius: parent.tokens.radius.borderRadius,
        spacing: '16px',
      };
    } else {
      errors.push({
        message: `'${themeNode.parentTheme}' adlı ana tema tapılmadı. Standart dəyərlər istifadə olunur.`,
        line: 1,
        column: 1,
        severity: 'info',
      });
    }
  }

  // Merge overrides
  const resolvedColors = { ...baseColors, ...themeNode.colors };
  const resolvedTypography = { ...baseTypography, ...themeNode.typography };
  const resolvedLayout = { ...baseLayout, ...themeNode.layout };

  // Resolve variable helper: e.g. "colors.primary" -> "#00D37D"
  const resolveValue = (val: string, visited = new Set<string>()): string => {
    if (!val || typeof val !== 'string') return val;
    if (val.startsWith('colors.')) {
      const colorKey = val.slice('colors.'.length);
      const target = resolvedColors[colorKey];
      if (!target) {
        errors.push({
          message: `'${val}' dəyişəni 'colors' blokunda tapılmadı.`,
          line: 1,
          column: 1,
          severity: 'warning',
        });
        return '#000000';
      }
      if (visited.has(val)) return target;
      visited.add(val);
      return resolveValue(target, visited);
    }

    if (val.startsWith('typography.')) {
      const typoKey = val.slice('typography.'.length);
      return resolvedTypography[typoKey] || val;
    }

    if (val.startsWith('layout.')) {
      const layoutKey = val.slice('layout.'.length);
      return resolvedLayout[layoutKey] || val;
    }

    return val;
  };

  // Resolve all colors
  for (const [k, v] of Object.entries(resolvedColors)) {
    resolvedColors[k] = resolveValue(v);
  }

  // Resolve all components
  const resolvedComponents: Record<string, Record<string, string>> = { ...baseComponents };
  for (const [compName, compProps] of Object.entries(themeNode.components)) {
    resolvedComponents[compName] = { ...(resolvedComponents[compName] || {}) };
    for (const [propKey, propVal] of Object.entries(compProps)) {
      resolvedComponents[compName][propKey] = resolveValue(propVal);
    }
  }

  // Generate CSS Variables
  const cssVariables: Record<string, string> = {
    '--sitex-primary': resolvedColors.primary || '#00D37D',
    '--sitex-secondary': resolvedColors.secondary || '#1A1A2E',
    '--sitex-accent': resolvedColors.accent || '#D4A574',
    '--sitex-background': resolvedColors.background || '#FFFFFF',
    '--sitex-surface': resolvedColors.surface || '#F8FAFC',
    '--sitex-text': resolvedColors.text || '#111315',
    '--sitex-font-heading': resolvedTypography.heading || 'Outfit, sans-serif',
    '--sitex-font-body': resolvedTypography.body || 'Inter, sans-serif',
    '--sitex-base-size': resolvedTypography.baseSize || '16px',
    '--sitex-container-width': resolvedLayout.containerWidth || '1200px',
    '--sitex-radius': resolvedLayout.borderRadius || '12px',
    '--sitex-spacing': resolvedLayout.spacing || '16px',
  };

  // Compile CSS Rules
  const compiledCss = `
.sitex-theme-preview {
  ${Object.entries(cssVariables)
    .map(([k, v]) => `${k}: ${v};`)
    .join('\n  ')}
  background-color: var(--sitex-background);
  color: var(--sitex-text);
  font-family: var(--sitex-font-body);
}

.sitex-theme-preview h1,
.sitex-theme-preview h2,
.sitex-theme-preview h3,
.sitex-theme-preview h4 {
  font-family: var(--sitex-font-heading);
}

.sitex-theme-preview .sitex-btn {
  background: ${resolvedComponents.button?.background || 'var(--sitex-primary)'};
  color: ${resolvedComponents.button?.color || '#000000'};
  border-radius: ${resolvedComponents.button?.radius || 'var(--sitex-radius)'};
  padding: ${resolvedComponents.button?.padding || '10px 20px'};
  font-weight: 600;
  transition: all 0.2s ease;
}

.sitex-theme-preview .sitex-card {
  background: ${resolvedComponents.card?.background || 'var(--sitex-surface)'};
  border-radius: ${resolvedComponents.card?.radius || 'var(--sitex-radius)'};
  box-shadow: ${resolvedComponents.card?.shadow || '0 4px 16px rgba(0,0,0,0.06)'};
  padding: ${resolvedComponents.card?.padding || '20px'};
}
`.trim();

  return {
    success: errors.filter((e) => e.severity === 'error').length === 0,
    theme: {
      ...themeNode,
      colors: resolvedColors,
      typography: resolvedTypography,
      layout: resolvedLayout,
      components: resolvedComponents,
    },
    errors,
    cssVariables,
    compiledCss,
  };
}

export function convertSTLToThemeDefinition(themeNode: STLThemeNode): ThemeDefinition {
  const compiled = compileSTL(themeNode);
  const colors = compiled.theme?.colors || {};
  const typography = compiled.theme?.typography || {};
  const layout = compiled.theme?.layout || {};

  const tokens: ThemeTokens = {
    colors: {
      primary: colors.primary || '#00D37D',
      secondary: colors.secondary || '#1A1A2E',
      accent: colors.accent || '#D4A574',
      background: colors.background || '#FFFFFF',
      text: colors.text || '#111315',
    },
    typography: {
      headingFont: typography.heading || 'Outfit',
      bodyFont: typography.body || 'Inter',
    },
    spacing: {
      heroHeight: '85vh',
      heroOverlay: 0.5,
    },
    radius: {
      borderRadius: layout.borderRadius || '12px',
    },
    customProps: {
      stlTheme: themeNode,
      cssVariables: compiled.cssVariables,
    },
  };

  return {
    id: themeNode.id.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    name: themeNode.meta.name || themeNode.id,
    slug: (themeNode.meta.name || themeNode.id).toLowerCase().replace(/\s+/g, '-'),
    description: themeNode.meta.description || 'SiteX STL ilə yaradılmış unikal tema',
    version: themeNode.meta.version || '1.0.0',
    source: 'custom',
    previewGradient: [colors.primary || '#00D37D', colors.secondary || '#1A1A2E'],
    category: ['xususi-tema', 'stl-tema'],
    tokens,
    layout: {
      headerStyle: 'glass',
      footerStyle: 'dark',
      buttonStyle: 'solid',
      cardStyle: 'elevated',
    },
    sections: [],
    createdAt: new Date().toISOString(),
  };
}
