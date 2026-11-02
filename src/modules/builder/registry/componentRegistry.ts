import { ComponentDefinition } from '../types';

export function normalizeComponentType(type: string): string {
  return (type || '')
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, '');
}

class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();
  private normalized = new Map<string, ComponentDefinition>();

  public register(component: ComponentDefinition): void {
    this.components.set(component.type, component);
    this.normalized.set(normalizeComponentType(component.type), component);
  }

  public get(type: string): ComponentDefinition | undefined {
    if (!type) return undefined;
    const direct = this.components.get(type);
    if (direct) return direct;
    return this.normalized.get(normalizeComponentType(type));
  }

  public has(type: string): boolean {
    return !!this.get(type);
  }

  public list(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  public listByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return this.list().filter((c) => c.category === category);
  }
}

export const componentRegistry = new ComponentRegistry();

export function registerComponent(comp: ComponentDefinition): void {
  componentRegistry.register(comp);
}

export function getComponent(type: string): ComponentDefinition | undefined {
  return componentRegistry.get(type);
}

export function hasComponent(type: string): boolean {
  return componentRegistry.has(type);
}

export function listComponents(): ComponentDefinition[] {
  return componentRegistry.list();
}



