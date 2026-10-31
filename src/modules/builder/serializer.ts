import { BuilderTemplateDocument } from './types';
import { ThemeDefinition } from '../themes/types';

export function serializeTemplateToTheme(doc: BuilderTemplateDocument): ThemeDefinition {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    previewGradient: ['#1E2022', '#121416'],
    category: ['xususi-tema', 'restoran-ve-qida-sayti'],
    version: doc.version || '1.0.0',
    source: 'custom',
    createdAt: doc.updatedAt || new Date().toISOString(),
    tokens: {
      colors: {
        primary: doc.tokens?.primary || '#00D37D',
        secondary: doc.tokens?.secondary || '#1E2022',
        accent: doc.tokens?.accent || '#D4A574',
        background: doc.tokens?.background || '#121416',
        text: doc.tokens?.text || '#F5F5F7',
      },
      typography: {
        headingFont: doc.tokens?.headingFont || 'Outfit',
        bodyFont: doc.tokens?.bodyFont || 'Inter',
      },
      spacing: {
        heroHeight: '85vh',
        heroOverlay: 0.5,
      },
      radius: {
        borderRadius: '12px',
      },
      customProps: {
        builderNodes: doc.nodes,
      },
    },
    layout: {
      headerStyle: 'glass',
      footerStyle: 'dark',
      buttonStyle: 'solid',
      cardStyle: 'elevated',
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
  return JSON.stringify(doc, null, 2);
}

export function importTemplateFromJSON(jsonString: string): BuilderTemplateDocument {
  const parsed = JSON.parse(jsonString);
  if (!parsed.id || !Array.isArray(parsed.nodes)) {
    throw new Error('Etibarsız şablon JSON faylı');
  }
  return parsed as BuilderTemplateDocument;
}
