'use client';

import { useEditorStore, useSelectedNode } from '@/features/template-builder/hooks/useEditor';
import { useBlockRegistry } from '@/features/template-builder/hooks/useRegistry';
import type { BlockSchemaField } from '@/features/template-builder/types';

export function PropertiesPanel() {
  const store = useEditorStore();
  const node = useSelectedNode();
  const { blocks } = useBlockRegistry();

  if (!node) {
    return (
      <div style={{ padding: 20, color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
        Bir bileşen seçin
      </div>
    );
  }

  const blockDef = blocks.find((b) => b.type === node.type);
  const schema: BlockSchemaField[] = blockDef?.schema ?? [];

  return (
    <div style={{ padding: 20, overflowY: 'auto', background: '#f8fafc', height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#111827' }}>{blockDef?.name ?? node.type}</h3>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{node.id}</p>
      </div>

      {schema.length === 0 && (
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Bu bileşen için özelleştirilebilir alan yok.</p>
      )}

      {schema.map((field) => (
        <div key={field.name} style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
            {field.label}{field.required ? ' *' : ''}
          </label>
          <SchemaField
            field={field}
            value={node.props[field.name]}
            onChange={(value) => store.updateNode(node.id, { props: { ...node.props, [field.name]: value } })}
          />
        </div>
      ))}

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#374151' }}>Stil</h4>
        <StyleField
          label='Genişlik'
          key='width'
          value={node.styles.width}
          onChange={(v) => store.updateNode(node.id, { styles: { ...node.styles, width: v } })}
        />
        <StyleField
          label='Yükseklik'
          key='height'
          value={node.styles.height}
          onChange={(v) => store.updateNode(node.id, { styles: { ...node.styles, height: v } })}
        />
        <StyleField
          label='Arka plan rengi'
          key='backgroundColor'
          type='color'
          value={node.styles.backgroundColor}
          onChange={(v) => store.updateNode(node.id, { styles: { ...node.styles, backgroundColor: v } })}
        />
        <StyleField
          label='Yazı rengi'
          key='color'
          type='color'
          value={node.styles.color}
          onChange={(v) => store.updateNode(node.id, { styles: { ...node.styles, color: v } })}
        />
        <StyleField
          label='Yazı boyutu'
          key='fontSize'
          type='number'
          value={typeof node.styles.fontSize === 'number' ? node.styles.fontSize : ''}
          onChange={(v) => store.updateNode(node.id, { styles: { ...node.styles, fontSize: v === '' ? undefined : Number(v) } })}
        />
      </div>
    </div>
  );
}

function SchemaField({ field, value, onChange }: { field: BlockSchemaField; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case 'text':
      return <InputField value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <InputField type='number' value={String(value ?? '')} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} />;
    case 'color':
      return <InputField type='color' value={String(value ?? '#000000')} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return (
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(parseOptionValue(e.target.value, field.options))}
          style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}
        >
          {(field.options ?? []).map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case 'boolean':
      return (
        <input
          type='checkbox'
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 16, height: 16 }}
        />
      );
    default:
      return <InputField value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />;
  }
}

function InputField({ type = 'text', value, onChange }: { type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}
    />
  );
}

function parseOptionValue(value: string, options: { label: string; value: unknown }[] = []): unknown {
  const match = options.find((o) => String(o.value) === value);
  if (match) return match.value;
  return value;
}

function StyleField({ label, type = 'text', value, onChange }: { label: string; type?: string; value: string | number | undefined; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#6b7280' }}>{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}
      />
    </div>
  );
}
