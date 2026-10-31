export { TemplateBuilder } from '@/features/template-builder/components/TemplateBuilder';
export { TemplateRenderer } from '@/features/template-builder/components/TemplateRenderer';
export { registerBlock, blockRegistry } from '@/features/template-builder/registry/blockRegistry';
export { createTemplateRepository } from '@/features/template-builder/services';
export type {
  Template,
  TemplateNode,
  BlockDefinition,
  BlockSchemaField,
  TemplateRepository,
  DeviceType,
} from '@/features/template-builder/types';
