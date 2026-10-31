import type { Template, TemplateRepository } from '@/features/template-builder/types';

/**
 * REST adapter iskeleti. Gerçek bir back-end entegrasyonunda bu sınıf
 * extend edilir ve fetch ile API çağrıları yapılır.
 *
 * Şu an sadece arayüzü karşılar ve "Not Implemented" fırlatır,
 * böylece derleme hata verilmez ama işlevsellik eksiktir.
 */
export class RestTemplateRepository implements TemplateRepository {
  private baseUrl: string;

  constructor(baseUrl = '/api/template-builder/templates') {
    this.baseUrl = baseUrl;
  }

  async list(): Promise<Template[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) throw new Error(`Failed to list templates: ${res.status}`);
    return res.json();
  }

  async get(id: string): Promise<Template | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to get template ${id}: ${res.status}`);
    return res.json();
  }

  async save(template: Template): Promise<void> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!res.ok) throw new Error(`Failed to save template: ${res.status}`);
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete template ${id}: ${res.status}`);
  }
}
