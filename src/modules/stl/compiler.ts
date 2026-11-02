import { STLThemeNode, STLCompilationResult, STLError } from './types';
import { ThemeDefinition, ThemeTokens } from '../themes/types';
import { getTheme } from '../themes/registry';
import { validateSTLTheme } from './validator';
import { STL_DIAGNOSTICS } from './diagnostics';
import {
  lightenColor,
  darkenColor,
  alphaColor,
  mixColors,
} from './colorUtils';

export function compileSTL(themeNode: STLThemeNode): STLCompilationResult {
  const errors: STLError[] = [];

  // 1. Validation
  const validationErrors = validateSTLTheme(themeNode);
  errors.push(...validationErrors);

  // 2. Base values
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
        code: STL_DIAGNOSTICS.SYNTAX_ERROR,
        message: `'${themeNode.parentTheme}' adlı ana tema tapılmadı. Standart dəyərlər istifadə olunur.`,
        line: 1,
        column: 1,
        severity: 'info',
      });
    }
  }

  // Merge overrides
  const resolvedColors: Record<string, string> = { ...baseColors, ...themeNode.colors };
  const resolvedTypography: Record<string, string> = { ...baseTypography, ...themeNode.typography };
  const resolvedLayout: Record<string, string> = { ...baseLayout, ...themeNode.layout };
  const tokensMap = themeNode.tokens || {};

  // Resolve helper: variable references & color functions
  const resolveValue = (val: string, visited = new Set<string>()): string => {
    if (!val || typeof val !== 'string') return val;
    val = val.trim();

    // Strip enclosing curly braces if present e.g. {tokens.spacing.md}
    if (val.startsWith('{') && val.endsWith('}')) {
      val = val.slice(1, -1).trim();
    }

    // Handle function calls: lighten(colors.primary, 10%)
    const fnMatch = val.match(/^([a-zA-Z_]+)\s*\((.+)\)$/);
    if (fnMatch) {
      const fnName = fnMatch[1].toLowerCase();
      const rawArgs = fnMatch[2].split(',').map((a) => a.trim());

      if (fnName === 'lighten' || fnName === 'darken') {
        const targetColor = resolveValue(rawArgs[0], visited);
        const pct = parseFloat(rawArgs[1]?.replace('%', '') || '10');
        return fnName === 'lighten' ? lightenColor(targetColor, pct) : darkenColor(targetColor, pct);
      }

      if (fnName === 'alpha') {
        const targetColor = resolveValue(rawArgs[0], visited);
        const op = parseFloat(rawArgs[1] || '1');
        return alphaColor(targetColor, op);
      }

      if (fnName === 'mix') {
        const c1 = resolveValue(rawArgs[0], visited);
        const c2 = resolveValue(rawArgs[1], visited);
        const wt = parseFloat(rawArgs[2]?.replace('%', '') || '50');
        return mixColors(c1, c2, wt);
      }
    }

    // Handle token reference: tokens.spacing.md or tokens.radius.sm
    if (val.startsWith('tokens.')) {
      const parts = val.split('.');
      if (parts.length >= 3) {
        const category = parts[1];
        const tokenName = parts.slice(2).join('.');
        const found = tokensMap[category]?.[tokenName];
        if (found) {
          if (visited.has(val)) return found;
          visited.add(val);
          return resolveValue(found, visited);
        }
      }
    }

    // Handle color reference: colors.primary
    if (val.startsWith('colors.')) {
      const colorKey = val.slice('colors.'.length);
      const target = resolvedColors[colorKey];
      if (!target) {
        errors.push({
          code: STL_DIAGNOSTICS.UNDEFINED_VARIABLE,
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

    // Handle typography reference: typography.heading
    if (val.startsWith('typography.')) {
      const typoKey = val.slice('typography.'.length);
      return resolvedTypography[typoKey] || val;
    }

    // Handle layout reference: layout.spacing
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

  // Resolve all typography
  for (const [k, v] of Object.entries(resolvedTypography)) {
    resolvedTypography[k] = resolveValue(v);
  }

  // Resolve all layout
  for (const [k, v] of Object.entries(resolvedLayout)) {
    resolvedLayout[k] = resolveValue(v);
  }

  // Resolve all components
  const resolvedComponents: Record<string, Record<string, string>> = { ...baseComponents };
  for (const [compName, compProps] of Object.entries(themeNode.components || {})) {
    resolvedComponents[compName] = { ...(resolvedComponents[compName] || {}) };
    for (const [propKey, propVal] of Object.entries(compProps)) {
      resolvedComponents[compName][propKey] = resolveValue(propVal);
    }
  }

  // Generate Base CSS Variables
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

  // Add design tokens to CSS variables
  if (themeNode.tokens) {
    for (const [category, catTokens] of Object.entries(themeNode.tokens)) {
      for (const [tokenKey, tokenVal] of Object.entries(catTokens)) {
        const resolvedTokenVal = resolveValue(tokenVal);
        cssVariables[`--sitex-token-${category}-${tokenKey}`] = resolvedTokenVal;
      }
    }
  }

  // Deterministic sorting of CSS Variables
  const sortedVars = Object.entries(cssVariables).sort(([a], [b]) => a.localeCompare(b));

  // Build Modes CSS (light / dark)
  let modesCss = '';
  if (themeNode.modes) {
    for (const [modeName, modeObj] of Object.entries(themeNode.modes)) {
      const modeColors = modeObj.colors || modeObj;
      const modeVarLines: string[] = [];

      for (const [colKey, colVal] of Object.entries(modeColors)) {
        if (typeof colVal === 'string') {
          const resolvedVal = resolveValue(colVal);
          modeVarLines.push(`  --sitex-${colKey}: ${resolvedVal};`);
        }
      }

      if (modeVarLines.length > 0) {
        // [data-theme="mode"]
        modesCss += `\n[data-theme="${modeName}"] .sitex-theme-preview,\n.sitex-theme-preview[data-theme="${modeName}"] {\n${modeVarLines.join('\n')}\n}\n`;

        // prefers-color-scheme media query for dark or light
        if (modeName === 'dark' || modeName === 'light') {
          modesCss += `\n@media (prefers-color-scheme: ${modeName}) {\n  .sitex-theme-preview:not([data-theme]) {\n  ${modeVarLines.join('\n  ')}\n  }\n}\n`;
        }
      }
    }
  }

  // Build Responsive CSS
  let responsiveCss = '';
  if (themeNode.responsive) {
    const bpRules: Record<string, string> = {
      mobile: '@media (max-width: 640px)',
      tablet: '@media (max-width: 1024px)',
    };

    for (const [bpName, bpObj] of Object.entries(themeNode.responsive)) {
      const mediaQuery = bpRules[bpName] || `@media (max-width: ${bpName})`;
      const bpProps: string[] = [];

      if (bpObj.layout) {
        if (bpObj.layout.containerWidth) {
          bpProps.push(`  --sitex-container-width: ${resolveValue(bpObj.layout.containerWidth)};`);
        }
        if (bpObj.layout.spacing) {
          bpProps.push(`  --sitex-spacing: ${resolveValue(bpObj.layout.spacing)};`);
        }
      }
      if (bpObj.typography?.baseSize) {
        bpProps.push(`  --sitex-base-size: ${resolveValue(bpObj.typography.baseSize)};`);
      }

      if (bpProps.length > 0) {
        responsiveCss += `\n${mediaQuery} {\n  .sitex-theme-preview {\n  ${bpProps.join('\n  ')}\n  }\n}\n`;
      }
    }
  }

  // Compile full CSS
  const compiledCss = `
.sitex-theme-preview {
  ${sortedVars.map(([k, v]) => `${k}: ${v};`).join('\n  ')}
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
${modesCss}
${responsiveCss}
`.trim();

  // Generate Tailwind configuration object
  const tailwindConfig = {
    theme: {
      extend: {
        colors: {
          sitex: {
            primary: 'var(--sitex-primary)',
            secondary: 'var(--sitex-secondary)',
            accent: 'var(--sitex-accent)',
            background: 'var(--sitex-background)',
            surface: 'var(--sitex-surface)',
            text: 'var(--sitex-text)',
          },
        },
        fontFamily: {
          heading: ['var(--sitex-font-heading)', 'sans-serif'],
          body: ['var(--sitex-font-body)', 'sans-serif'],
        },
        borderRadius: {
          sitex: 'var(--sitex-radius)',
        },
        spacing: {
          sitex: 'var(--sitex-spacing)',
        },
      },
    },
  };

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
    tailwindConfig,
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
