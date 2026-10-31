import type { Template, TemplateRepository, PersistedTemplate } from '@/features/template-builder/types';

const STORAGE_KEY = 'template-builder-templates';

export class LocalStorageTemplateRepository implements TemplateRepository {
  private readAll(): PersistedTemplate[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as PersistedTemplate[];
    } catch {
      return [];
    }
  }

  private writeAll(templates: PersistedTemplate[]): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }

  async list(): Promise<Template[]> {
    return Promise.resolve(this.readAll().map((t) => this.toTemplate(t)));
  }

  async get(id: string): Promise<Template | null> {
    return Promise.resolve(this.readAll().find((t) => t.id === id) ?? null).then((t) => (t ? this.toTemplate(t) : null));
  }

  async save(template: Template): Promise<void> {
    const templates = this.readAll();
    const persisted: PersistedTemplate = {
      id: template.id,
      name: template.name,
      version: template.version,
      nodes: template.nodes,
      updatedAt: new Date().toISOString(),
    };
    const idx = templates.findIndex((t) => t.id === template.id);
    if (idx === -1) templates.push(persisted);
    else templates[idx] = persisted;
    this.writeAll(templates);
  }

  async delete(id: string): Promise<void> {
    const templates = this.readAll().filter((t) => t.id !== id);
    this.writeAll(templates);
  }

  private toTemplate(p: PersistedTemplate): Template {
    return { id: p.id, name: p.name, version: p.version, nodes: p.nodes };
  }
}
