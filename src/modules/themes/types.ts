import { z } from 'zod';

export const ThemeTokensSchema = z.object({
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
    whatsapp: z.string().optional(),
    whatsappIcon: z.string().optional(),
  }),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    brandFont: z.string().optional(),
  }),
  spacing: z.object({
    heroHeight: z.string().default('85vh'),
    heroOverlay: z.number().default(0.5),
  }),
  radius: z.object({
    borderRadius: z.string().default('12px'),
  }),
  shadow: z.object({
    cardShadow: z.string().optional(),
  }).optional(),
  breakpoints: z.object({
    sm: z.string().default('640px'),
    md: z.string().default('768px'),
    lg: z.string().default('1024px'),
    xl: z.string().default('1280px'),
  }).optional(),
  customProps: z.record(z.string(), z.any()).optional(),
});

export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;

export const ThemeSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  props: z.record(z.string(), z.any()),
  order: z.number().default(0),
});

export type ThemeSection = z.infer<typeof ThemeSectionSchema>;

export const ThemeLayoutSchema = z.object({
  headerStyle: z.enum(['transparent', 'solid', 'glass']).default('transparent'),
  footerStyle: z.enum(['dark', 'light', 'accent']).default('dark'),
  buttonStyle: z.enum(['solid', 'outline', 'ghost']).default('solid'),
  cardStyle: z.enum(['elevated', 'flat', 'bordered']).default('elevated'),
});

export type ThemeLayout = z.infer<typeof ThemeLayoutSchema>;

export const ThemeDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  previewImage: z.string().optional(),
  previewGradient: z.array(z.string()).optional(),
  category: z.array(z.string()).default([]),
  version: z.string().default('1.0.0'),
  source: z.enum(['builtin', 'custom']).default('builtin'),
  tokens: ThemeTokensSchema,
  layout: ThemeLayoutSchema,
  sections: z.array(ThemeSectionSchema).default([]),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export type ThemeDefinition = z.infer<typeof ThemeDefinitionSchema>;

