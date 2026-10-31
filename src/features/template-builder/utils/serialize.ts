export function serializeTemplate(template: import('@/features/template-builder/types').Template): string {
  return JSON.stringify(template, null, 2);
}

export function deserializeTemplate(json: string): import('@/features/template-builder/types').Template {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid template JSON');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid template JSON');
  }
  return parsed as import('@/features/template-builder/types').Template;
}

export function addVersion(template: import('@/features/template-builder/types').Template): import('@/features/template-builder/types').Template {
  return { ...template, version: '1.0.0' };
}
