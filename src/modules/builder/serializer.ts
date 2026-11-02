import { BuilderTemplateDocument, GlobalDesignTokens } from './types';
import { ThemeDefinition } from '../themes/types';
import { parseSTL, compileSTL, stringifySTL } from '../stl';

export const DEFAULT_DESIGN_TOKENS: GlobalDesignTokens = {
  colors: {
    primary: '#00D37D',
    secondary: '#1A1A2E',
    accent: '#D4A574',
    background: '#0F1115',
    surface: '#181B20',
    text: '#F5F5F7',
    mutedText: '#8888A0',
  },
  typography: {
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    baseSize: '16px',
    lineHeight: '1.6',
  },
  layout: {
    containerWidth: '1200px',
    borderRadius: '12px',
    spacing: '16px',
    shadowStyle: 'medium',
  },
  header: {
    style: 'glass',
    height: '72px',
  },
  footer: {
    style: 'dark',
  },
  components: {
    button: {
      style: 'solid',
      radius: '8px',
      size: 'medium',
    },
    card: {
      style: 'elevated',
      radius: '12px',
      padding: '20px',
    },
    input: {
      radius: '8px',
      borderStyle: 'solid',
    },
    badge: {
      radius: '9999px',
    },
  },
};

export function designTokensToSTL(doc: BuilderTemplateDocument, tokens: GlobalDesignTokens): string {
  const stlNode = {
    type: 'Theme' as const,
    id: doc.id || 'CustomTheme',
    meta: {
      name: doc.name || 'SiteX Custom Theme',
      version: doc.version || '1.0.0',
      author: 'SiteX User',
      description: doc.description || 'Professional website theme built with SiteX Theme Builder',
    },
    colors: { ...tokens.colors },
    typography: {
      heading: tokens.typography.headingFont,
      body: tokens.typography.bodyFont,
      baseSize: tokens.typography.baseSize,
    },
    layout: {
      containerWidth: tokens.layout.containerWidth,
      borderRadius: tokens.layout.borderRadius,
      spacing: tokens.layout.spacing,
    },
    components: {
      button: {
        background: 'colors.primary',
        color: '#000000',
        radius: tokens.components.button.radius,
        style: tokens.components.button.style,
      },
      card: {
        background: 'colors.surface',
        radius: tokens.components.card.radius,
        style: tokens.components.card.style,
      },
      header: {
        style: tokens.header.style,
      },
      footer: {
        style: tokens.footer.style,
      },
    },
    customBlocks: {},
    rawAst: [],
    loc: { line: 1, column: 1 },
  };

  return stringifySTL(stlNode);
}

export function stlToDesignTokens(stlCode: string, fallback = DEFAULT_DESIGN_TOKENS): GlobalDesignTokens {
  const { ast } = parseSTL(stlCode);
  if (!ast) return fallback;

  return {
    colors: {
      primary: ast.colors.primary || fallback.colors.primary,
      secondary: ast.colors.secondary || fallback.colors.secondary,
      accent: ast.colors.accent || fallback.colors.accent,
      background: ast.colors.background || fallback.colors.background,
      surface: ast.colors.surface || fallback.colors.surface,
      text: ast.colors.text || fallback.colors.text,
      mutedText: ast.colors.mutedText || fallback.colors.mutedText,
    },
    typography: {
      headingFont: ast.typography.heading || fallback.typography.headingFont,
      bodyFont: ast.typography.body || fallback.typography.bodyFont,
      baseSize: ast.typography.baseSize || fallback.typography.baseSize,
      lineHeight: fallback.typography.lineHeight,
    },
    layout: {
      containerWidth: ast.layout.containerWidth || fallback.layout.containerWidth,
      borderRadius: ast.layout.borderRadius || fallback.layout.borderRadius,
      spacing: ast.layout.spacing || fallback.layout.spacing,
      shadowStyle: fallback.layout.shadowStyle,
    },
    header: {
      style: (ast.components.header?.style as any) || fallback.header.style,
    },
    footer: {
      style: (ast.components.footer?.style as any) || fallback.footer.style,
    },
    components: {
      button: {
        style: (ast.components.button?.style as any) || fallback.components.button.style,
        radius: ast.components.button?.radius || fallback.components.button.radius,
        size: fallback.components.button.size,
      },
      card: {
        style: (ast.components.card?.style as any) || fallback.components.card.style,
        radius: ast.components.card?.radius || fallback.components.card.radius,
        padding: fallback.components.card.padding,
      },
      input: fallback.components.input,
      badge: fallback.components.badge,
    },
  };
}

export function serializeTemplateToTheme(doc: BuilderTemplateDocument): ThemeDefinition {
  const tokens = doc.designTokens || DEFAULT_DESIGN_TOKENS;

  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    previewGradient: [tokens.colors.primary, tokens.colors.secondary],
    category: ['xususi-tema', 'restoran-ve-qida-sayti', 'stl-tema'],
    version: doc.version || '1.0.0',
    source: 'custom',
    createdAt: doc.updatedAt || new Date().toISOString(),
    tokens: {
      colors: {
        primary: tokens.colors.primary,
        secondary: tokens.colors.secondary,
        accent: tokens.colors.accent,
        background: tokens.colors.background,
        text: tokens.colors.text,
      },
      typography: {
        headingFont: tokens.typography.headingFont,
        bodyFont: tokens.typography.bodyFont,
      },
      spacing: {
        heroHeight: '85vh',
        heroOverlay: 0.5,
      },
      radius: {
        borderRadius: tokens.layout.borderRadius,
      },
      customProps: {
        builderNodes: doc.nodes,
        designTokens: tokens,
        stlCode: doc.stlCode,
      },
    },
    layout: {
      headerStyle: tokens.header.style === 'transparent' ? 'transparent' : tokens.header.style === 'solid' ? 'solid' : 'glass',
      footerStyle: tokens.footer.style === 'light' ? 'light' : tokens.footer.style === 'accent' ? 'accent' : 'dark',
      buttonStyle: tokens.components.button.style === 'outline' ? 'outline' : tokens.components.button.style === 'ghost' ? 'ghost' : 'solid',
      cardStyle: tokens.components.card.style === 'flat' ? 'flat' : tokens.components.card.style === 'bordered' ? 'bordered' : 'elevated',
    },
    sections: doc.nodes.map((n, idx) => ({
      id: n.id,
      type: n.type,
      name: n.type,
      props: n.props,
      order: idx,
    })),
  };
}

export function exportTemplateAsJSON(doc: BuilderTemplateDocument): string {
  const versionedDoc = {
    schemaVersion: 2,
    ...doc,
  };
  return JSON.stringify(versionedDoc, null, 2);
}

export function importTemplateFromJSON(jsonString: string): BuilderTemplateDocument {
  const parsed = JSON.parse(jsonString);
  if (!parsed.id || !Array.isArray(parsed.nodes)) {
    throw new Error('Etibarsız şablon JSON faylı');
  }
  // Auto-migration for legacy schema versions
  if (!parsed.schemaVersion || parsed.schemaVersion < 2) {
    parsed.schemaVersion = 2;
    parsed.updatedAt = new Date().toISOString();
  }
  return parsed as BuilderTemplateDocument;
}
