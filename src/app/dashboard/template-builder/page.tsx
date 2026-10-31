'use client';

import dynamic from 'next/dynamic';

const TemplateBuilder = dynamic(
  () => import('@/features/template-builder').then((mod) => mod.TemplateBuilder),
  { loading: () => <div style={{ padding: 40, color: '#6b7280' }}>Yükleniyor...</div>, ssr: false },
);

const ENABLED = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_TEMPLATE_BUILDER === 'true';

export default function TemplateBuilderPage() {
  if (!ENABLED) {
    return (
      <div style={{ padding: 40, color: '#6b7280', textAlign: 'center' }}>
        Şablon İnşaatçı özelliği devre dışıdır. NEXT_PUBLIC_ENABLE_TEMPLATE_BUILDER=true ile etkinleştirin.
      </div>
    );
  }

  return <TemplateBuilder onSave={(t) => console.log('[template-builder] saved', t)} onPublish={(t) => console.log('[template-builder] published', t)} />;
}
