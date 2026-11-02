import { STLCompletionItem, STLThemeNode } from './types';

export const STL_KEYWORD_COMPLETIONS: STLCompletionItem[] = [
  {
    label: 'theme',
    kind: 'keyword',
    detail: 'Yeni tema bloku təyini',
    insertText: 'theme "${1:TemaAdı}" {\n  $0\n}',
  },
  {
    label: 'import',
    kind: 'keyword',
    detail: 'Xarici STL faylını daxil et',
    insertText: 'import "${1:colors.stl}"',
  },
  {
    label: 'meta',
    kind: 'keyword',
    detail: 'Tema metadata bloku',
    insertText:
      'meta {\n  name: "${1:Mənim Temam}"\n  version: "1.0.0"\n  author: "SiteX User"\n}',
  },
  {
    label: 'colors',
    kind: 'keyword',
    detail: 'Rəng palitrası bloku',
    insertText:
      'colors {\n  primary: "#00D37D"\n  secondary: "#1A1A2E"\n  accent: "#D4A574"\n  background: "#FFFFFF"\n  surface: "#F8FAFC"\n  text: "#111315"\n}',
  },
  {
    label: 'tokens',
    kind: 'keyword',
    detail: 'Dizayn tokenləri şkalası',
    insertText:
      'tokens {\n  spacing {\n    sm: "8px"\n    md: "16px"\n    lg: "24px"\n  }\n  radius {\n    sm: "4px"\n    md: "8px"\n    lg: "16px"\n  }\n}',
  },
  {
    label: 'modes',
    kind: 'keyword',
    detail: 'Light və Dark rejim sazlamaları',
    insertText:
      'modes {\n  dark {\n    colors {\n      background: "#0D0E11"\n      surface: "#181B20"\n      text: "#F5F5F7"\n    }\n  }\n}',
  },
  {
    label: 'responsive',
    kind: 'keyword',
    detail: 'Cihaz breakpoint override-ları',
    insertText:
      'responsive {\n  mobile {\n    layout {\n      containerWidth: "100%"\n      spacing: "12px"\n    }\n  }\n}',
  },
  {
    label: 'typography',
    kind: 'keyword',
    detail: 'Şrift və tipoqrafiya bloku',
    insertText:
      'typography {\n  heading: "Outfit"\n  body: "Inter"\n  baseSize: "16px"\n}',
  },
  {
    label: 'layout',
    kind: 'keyword',
    detail: 'Tərtibat və ölçü bloku',
    insertText:
      'layout {\n  containerWidth: "1200px"\n  borderRadius: "12px"\n  spacing: "16px"\n}',
  },
  {
    label: 'components',
    kind: 'keyword',
    detail: 'Komponent stilləri bloku',
    insertText:
      'components {\n  button {\n    background: colors.primary\n    color: "#FFFFFF"\n    radius: "8px"\n  }\n  card {\n    background: colors.surface\n    radius: "12px"\n  }\n}',
  },
  {
    label: 'extends',
    kind: 'keyword',
    detail: 'Ana temadan miras alma',
    insertText: 'extends "${1:ParentTheme}"',
  },
];

export const STL_FUNCTION_COMPLETIONS: STLCompletionItem[] = [
  {
    label: 'lighten',
    kind: 'value',
    detail: 'Rəngi faizlə aç',
    insertText: 'lighten(${1:colors.primary}, ${2:15%})',
  },
  {
    label: 'darken',
    kind: 'value',
    detail: 'Rəngi faizlə tündləşdir',
    insertText: 'darken(${1:colors.primary}, ${2:15%})',
  },
  {
    label: 'alpha',
    kind: 'value',
    detail: 'Rəngə şəffaflıq ver (0.0 - 1.0)',
    insertText: 'alpha(${1:colors.primary}, ${2:0.5})',
  },
  {
    label: 'mix',
    kind: 'value',
    detail: 'İki rəngi qarışdır',
    insertText: 'mix(${1:colors.primary}, ${2:#FFFFFF}, ${3:50%})',
  },
];

export const STL_PROPERTY_COMPLETIONS: STLCompletionItem[] = [
  // colors
  { label: 'primary', kind: 'property', detail: 'Əsas rəng', insertText: 'primary: "#00D37D"' },
  { label: 'secondary', kind: 'property', detail: 'İkinci dərəcəli rəng', insertText: 'secondary: "#1A1A2E"' },
  { label: 'accent', kind: 'property', detail: 'Vurğu rəngi', insertText: 'accent: "#D4A574"' },
  { label: 'background', kind: 'property', detail: 'Arxa fon rəngi', insertText: 'background: "#FFFFFF"' },
  { label: 'surface', kind: 'property', detail: 'Kart və səth rəngi', insertText: 'surface: "#F8FAFC"' },
  { label: 'text', kind: 'property', detail: 'Mətn rəngi', insertText: 'text: "#111315"' },
  { label: 'mutedText', kind: 'property', detail: 'Sönük mətn rəngi', insertText: 'mutedText: "#8888A0"' },
  // typography
  { label: 'heading', kind: 'property', detail: 'Başlıq şrifti', insertText: 'heading: "Outfit"' },
  { label: 'body', kind: 'property', detail: 'Əsas mətn şrifti', insertText: 'body: "Inter"' },
  { label: 'baseSize', kind: 'property', detail: 'Baza şrift ölçüsü', insertText: 'baseSize: "16px"' },
  // layout
  { label: 'containerWidth', kind: 'property', detail: 'Maksimum konteyner eni', insertText: 'containerWidth: "1200px"' },
  { label: 'borderRadius', kind: 'property', detail: 'Künc yuvarlaqlığı', insertText: 'borderRadius: "12px"' },
  { label: 'spacing', kind: 'property', detail: 'Standart ara məsafəsi', insertText: 'spacing: "16px"' },
  // components
  { label: 'button', kind: 'component', detail: 'Düymə komponenti', insertText: 'button {\n  background: colors.primary\n  color: "#FFFFFF"\n  radius: "8px"\n}' },
  { label: 'card', kind: 'component', detail: 'Kart komponenti', insertText: 'card {\n  background: colors.surface\n  radius: "12px"\n}' },
  { label: 'badge', kind: 'component', detail: 'Nişan (badge) komponenti', insertText: 'badge {\n  background: colors.accent\n  color: "#FFFFFF"\n  radius: "9999px"\n}' },
  { label: 'input', kind: 'component', detail: 'Form daxiletmə sahəsi', insertText: 'input {\n  background: "#FFFFFF"\n  border: "1px solid #E2E8F0"\n  radius: "8px"\n}' },
];

export const STL_VARIABLE_COMPLETIONS: STLCompletionItem[] = [
  { label: 'colors.primary', kind: 'variable', detail: 'Əsas rəng dəyişəni', insertText: 'colors.primary' },
  { label: 'colors.secondary', kind: 'variable', detail: 'İkinci dərəcəli rəng dəyişəni', insertText: 'colors.secondary' },
  { label: 'colors.accent', kind: 'variable', detail: 'Vurğu rəngi dəyişəni', insertText: 'colors.accent' },
  { label: 'colors.background', kind: 'variable', detail: 'Arxa fon rəngi dəyişəni', insertText: 'colors.background' },
  { label: 'colors.surface', kind: 'variable', detail: 'Səth rəngi dəyişəni', insertText: 'colors.surface' },
  { label: 'colors.text', kind: 'variable', detail: 'Mətn rəngi dəyişəni', insertText: 'colors.text' },
  { label: 'tokens.spacing.sm', kind: 'variable', detail: 'Kiçik ara məsafəsi', insertText: 'tokens.spacing.sm' },
  { label: 'tokens.spacing.md', kind: 'variable', detail: 'Orta ara məsafəsi', insertText: 'tokens.spacing.md' },
  { label: 'tokens.spacing.lg', kind: 'variable', detail: 'Böyük ara məsafəsi', insertText: 'tokens.spacing.lg' },
  { label: 'tokens.radius.sm', kind: 'variable', detail: 'Kiçik radius tokeni', insertText: 'tokens.radius.sm' },
  { label: 'tokens.radius.md', kind: 'variable', detail: 'Orta radius tokeni', insertText: 'tokens.radius.md' },
  { label: 'layout.borderRadius', kind: 'variable', detail: 'Qlobal yuvarlaqlıq', insertText: 'layout.borderRadius' },
];

export function getSTLCompletions(
  currentWord = '',
  blockContext = '',
  currentTheme?: STLThemeNode
): STLCompletionItem[] {
  const word = currentWord.toLowerCase();

  // Dynamic variables from currentTheme
  const dynamicVars: STLCompletionItem[] = [];
  if (currentTheme?.colors) {
    for (const key of Object.keys(currentTheme.colors)) {
      dynamicVars.push({
        label: `colors.${key}`,
        kind: 'variable',
        detail: `Dinamik rəng: ${currentTheme.colors[key]}`,
        insertText: `colors.${key}`,
      });
    }
  }
  if (currentTheme?.tokens) {
    for (const [cat, tokens] of Object.entries(currentTheme.tokens)) {
      for (const tKey of Object.keys(tokens)) {
        dynamicVars.push({
          label: `tokens.${cat}.${tKey}`,
          kind: 'variable',
          detail: `Token dəyəri: ${tokens[tKey]}`,
          insertText: `tokens.${cat}.${tKey}`,
        });
      }
    }
  }

  let pool = [
    ...STL_KEYWORD_COMPLETIONS,
    ...STL_PROPERTY_COMPLETIONS,
    ...STL_FUNCTION_COMPLETIONS,
    ...dynamicVars,
    ...STL_VARIABLE_COMPLETIONS,
  ];

  if (blockContext.includes('components')) {
    pool = [...dynamicVars, ...STL_VARIABLE_COMPLETIONS, ...STL_FUNCTION_COMPLETIONS, ...STL_PROPERTY_COMPLETIONS];
  } else if (blockContext.includes('colors')) {
    pool = [...STL_PROPERTY_COMPLETIONS, ...STL_FUNCTION_COMPLETIONS];
  }

  if (!word) return pool.slice(0, 10);
  return pool.filter((item) => item.label.toLowerCase().includes(word)).slice(0, 12);
}
