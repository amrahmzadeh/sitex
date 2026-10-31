import { ThemeDefinition, ThemeDefinitionSchema } from './types';
import { elegantTheme } from './builtin/elegant';
import { modernTheme } from './builtin/modern';
import { classicTheme } from './builtin/classic';
import { warmGourmetProTheme } from './builtin/warm-gourmet';

class ThemeRegistry {
  private themes = new Map<string, ThemeDefinition>();

  constructor() {
    this.registerTheme(elegantTheme);
    this.registerTheme(modernTheme);
    this.registerTheme(classicTheme);
    this.registerTheme(warmGourmetProTheme);
  }

  public registerTheme(theme: ThemeDefinition): void {
    const validated = ThemeDefinitionSchema.parse(theme);
    this.themes.set(validated.id, validated);
  }

  public getTheme(idOrSlug: string): ThemeDefinition | undefined {
    if (this.themes.has(idOrSlug)) {
      return this.themes.get(idOrSlug);
    }
    for (const theme of this.themes.values()) {
      if (theme.slug === idOrSlug) {
        return theme;
      }
    }
    return undefined;
  }

  public listThemes(options?: {
    category?: string;
    source?: 'builtin' | 'custom';
  }): ThemeDefinition[] {
    let list = Array.from(this.themes.values());
    if (options?.category) {
      const cat = options.category.toLowerCase();
      list = list.filter((t) =>
        t.category.some((c) => c.toLowerCase() === cat || cat.includes(c.toLowerCase()))
      );
    }
    if (options?.source) {
      list = list.filter((t) => t.source === options.source);
    }
    return list;
  }

  public getAllThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }
}

export const themeRegistry = new ThemeRegistry();
export const registerTheme = (theme: ThemeDefinition) => themeRegistry.registerTheme(theme);
export const getTheme = (idOrSlug: string) => themeRegistry.getTheme(idOrSlug);
export const listThemes = (options?: { category?: string; source?: 'builtin' | 'custom' }) =>
  themeRegistry.listThemes(options);
