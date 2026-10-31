import type { TemplateRepository } from '@/features/template-builder/types';
import { LocalStorageTemplateRepository } from '@/features/template-builder/services/localStorageAdapter';
import { RestTemplateRepository } from '@/features/template-builder/services/restAdapter';

export function createTemplateRepository(useRest = false): TemplateRepository {
  if (useRest) return new RestTemplateRepository();
  return new LocalStorageTemplateRepository();
}
