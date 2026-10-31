import { ComponentDefinition } from '../types';

class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();

  public register(component: ComponentDefinition): void {
    this.components.set(component.type, component);
  }

  public get(type: string): ComponentDefinition | undefined {
    return this.components.get(type);
  }

  public list(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  public listByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return this.list().filter((c) => c.category === category);
  }
}

export const componentRegistry = new ComponentRegistry();
export const registerComponent = (comp: ComponentDefinition) => componentRegistry.register(comp);
export const getComponent = (type: string) => componentRegistry.get(type);
export const listComponents = () => componentRegistry.list();
