'use client';

import { useCallback } from 'react';
import { TemplateBuilderProvider } from '@/features/template-builder/hooks/useEditor';
import { BlockRegistryProvider } from '@/features/template-builder/hooks/useRegistry';
import { EditorShell } from '@/features/template-builder/components/EditorShell';
import { createTemplateRepository } from '@/features/template-builder/services';
import type { Template, TemplateRepository } from '@/features/template-builder/types';

export interface TemplateBuilderProps {
  template?: Template;
  onSave?: (template: Template) => void;
  onPublish?: (template: Template) => void;
  repository?: TemplateRepository;
}

export function TemplateBuilder({ template, onSave, onPublish, repository }: TemplateBuilderProps) {
  const repo = repository ?? createTemplateRepository(false);

  const handleSave = useCallback((t: Template) => {
    repo.save(t);
    onSave?.(t);
  }, [repo, onSave]);

  const handlePublish = useCallback((t: Template) => {
    onPublish?.(t);
  }, [onPublish]);

  return (
    <BlockRegistryProvider>
      <TemplateBuilderProvider template={template}>
        <EditorShell onSave={handleSave} onPublish={handlePublish} />
      </TemplateBuilderProvider>
    </BlockRegistryProvider>
  );
}
