'use client';

import type { BlockDefinition, TemplateNode } from '@/features/template-builder/types';
const textBlock: BlockDefinition = {
  type: 'text',
  name: 'Metin',
  component: TextBlock,
  defaultProps: { content: 'Yeni metin bloğu' },
  defaultStyles: { fontSize: 16, color: '#333333', marginBottom: 16 },
  schema: [
    { name: 'content', label: 'İçerik', type: 'text', default: 'Yeni metin bloğu', required: true },
  ],
  isContainer: false,
  canHaveChildren: false,
};

const headingBlock: BlockDefinition = {
  type: 'heading',
  name: 'Başlık',
  component: HeadingBlock,
  defaultProps: { content: 'Yeni başlık', level: 'h2' },
  defaultStyles: { fontSize: 24, fontWeight: 700, color: '#111111', marginBottom: 20 },
  schema: [
    { name: 'content', label: 'İçerik', type: 'text', default: 'Yeni başlık', required: true },
    { name: 'level', label: 'Seviye', type: 'select', default: 'h2', options: [
      { label: 'H1', value: 'h1' },
      { label: 'H2', value: 'h2' },
      { label: 'H3', value: 'h3' },
      { label: 'H4', value: 'h4' },
    ], required: true },
  ],
  isContainer: false,
  canHaveChildren: false,
};

const imageBlock: BlockDefinition = {
  type: 'image',
  name: 'Görsel',
  component: ImageBlock,
  defaultProps: { src: '', alt: 'Görsel' },
  defaultStyles: { width: '100%', maxWidth: 400, marginBottom: 20 },
  schema: [
    { name: 'src', label: 'Görsel URL', type: 'url', default: '', required: true },
    { name: 'alt', label: 'Alt metin', type: 'text', default: 'Görsel' },
  ],
  isContainer: false,
  canHaveChildren: false,
};

const buttonBlock: BlockDefinition = {
  type: 'button',
  name: 'Düğme',
  component: ButtonBlock,
  defaultProps: { text: 'Tıkla', url: '#' },
  defaultStyles: { backgroundColor: '#00D37D', color: '#ffffff', padding: '10px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', marginBottom: 16 },
  schema: [
    { name: 'text', label: 'Yazı', type: 'text', default: 'Tıkla', required: true },
    { name: 'url', label: 'Bağlantı', type: 'url', default: '#' },
  ],
  isContainer: false,
  canHaveChildren: false,
};

const containerBlock: BlockDefinition = {
  type: 'container',
  name: 'Konteyner / Bölüm',
  component: ContainerBlock,
  defaultProps: {},
  defaultStyles: { width: '100%', padding: 24, backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 20 },
  schema: [],
  isContainer: true,
  canHaveChildren: true,
};

const columnsBlock: BlockDefinition = {
  type: 'columns',
  name: 'Sütunlar',
  component: ColumnsBlock,
  defaultProps: { columnCount: 2 },
  defaultStyles: { display: 'flex', gap: 16, width: '100%', marginBottom: 20 },
  schema: [
    { name: 'columnCount', label: 'Sütun sayısı', type: 'number', default: 2, options: [
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
    ], required: true },
  ],
  isContainer: true,
  canHaveChildren: true,
};

const dividerBlock: BlockDefinition = {
  type: 'divider',
  name: 'Ayırıcı',
  component: DividerBlock,
  defaultProps: {},
  defaultStyles: { borderBottom: '1px solid #e5e7eb', margin: '24px 0', width: '100%' },
  schema: [],
  isContainer: false,
  canHaveChildren: false,
};

const spacerBlock: BlockDefinition = {
  type: 'spacer',
  name: 'Boşluk',
  component: SpacerBlock,
  defaultProps: { height: 24 },
  defaultStyles: { height: 24, width: '100%' },
  schema: [
    { name: 'height', label: 'Yükseklik (px)', type: 'number', default: 24 },
  ],
  isContainer: false,
  canHaveChildren: false,
};

const videoBlock: BlockDefinition = {
  type: 'video',
  name: 'Video',
  component: VideoBlock,
  defaultProps: { src: '' },
  defaultStyles: { width: '100%', maxWidth: 640, marginBottom: 20 },
  schema: [
    { name: 'src', label: 'Video URL', type: 'url', default: '', required: true },
  ],
  isContainer: false,
  canHaveChildren: false,
};

const formFieldBlock: BlockDefinition = {
  type: 'form-field',
  name: 'Form Alanı',
  component: FormFieldBlock,
  defaultProps: { label: 'Alan', type: 'text', required: false },
  defaultStyles: { marginBottom: 16, width: '100%' },
  schema: [
    { name: 'label', label: 'Etiket', type: 'text', default: 'Alan', required: true },
    { name: 'type', label: 'Alan türü', type: 'select', default: 'text', options: [
      { label: 'Metin', value: 'text' },
      { label: 'E-posta', value: 'email' },
      { label: 'Numara', value: 'number' },
      { label: 'Metin Alanı', value: 'textarea' },
    ], required: true },
    { name: 'required', label: 'Zorunlu', type: 'boolean', default: false },
  ],
  isContainer: false,
  canHaveChildren: false,
};

export const BUILTIN_BLOCKS: BlockDefinition[] = [
  textBlock,
  headingBlock,
  imageBlock,
  buttonBlock,
  containerBlock,
  columnsBlock,
  dividerBlock,
  spacerBlock,
  videoBlock,
  formFieldBlock,
];

type BlockProps = {
  node: TemplateNode;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (patch: Partial<TemplateNode>) => void;
};

function TextBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    fontSize: node.styles.fontSize ?? 16,
    color: node.styles.color ?? '#333333',
    marginBottom: node.styles.marginBottom ?? 16,
  };
  return <p style={style}>{String(node.props.content ?? '')}</p>;
}

function HeadingBlock({ node }: BlockProps) {
  const Tag = node.props.level === 'h1' ? 'h1' : node.props.level === 'h3' ? 'h3' : node.props.level === 'h4' ? 'h4' : 'h2';
  const style: React.CSSProperties = {
    fontSize: node.styles.fontSize ?? 24,
    fontWeight: node.styles.fontWeight ?? 700,
    color: node.styles.color ?? '#111111',
    marginBottom: node.styles.marginBottom ?? 20,
  };
  return <Tag style={style}>{String(node.props.content ?? '')}</Tag>;
}

function ImageBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    width: node.styles.width ?? '100%',
    maxWidth: node.styles.maxWidth ?? 400,
    marginBottom: node.styles.marginBottom ?? 20,
    borderRadius: node.styles.borderRadius ?? 0,
  };
  return <img src={String(node.props.src ?? '')} alt={String(node.props.alt ?? 'Görsel')} style={style} />;
}

function ButtonBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    backgroundColor: node.styles.backgroundColor ?? '#00D37D',
    color: node.styles.color ?? '#ffffff',
    padding: node.styles.padding ?? '10px 24px',
    borderRadius: node.styles.borderRadius ?? 6,
    border: node.styles.border ?? 'none',
    cursor: node.styles.cursor ?? 'pointer',
    marginBottom: node.styles.marginBottom ?? 16,
    fontSize: node.styles.fontSize ?? 16,
  };
  return (
    <button type="button" style={style} onClick={(e) => e.preventDefault()}>
      {String(node.props.text ?? 'Tıkla')}
    </button>
  );
}

function ContainerBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    width: node.styles.width ?? '100%',
    padding: typeof node.styles.padding === 'number' ? `${node.styles.padding}px` : (node.styles.padding ?? 24),
    backgroundColor: node.styles.backgroundColor ?? '#ffffff',
    borderRadius: node.styles.borderRadius ?? 0,
    marginBottom: node.styles.marginBottom ?? 20,
    display: 'flex',
    flexDirection: 'column',
    gap: typeof node.styles.gap === 'number' ? `${node.styles.gap}px` : (node.styles.gap ?? 0),
  };
  return <div style={style} />;
}

function ColumnsBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    display: 'flex',
    gap: typeof node.styles.gap === 'number' ? `${node.styles.gap}px` : (node.styles.gap ?? 16),
    width: node.styles.width ?? '100%',
    marginBottom: node.styles.marginBottom ?? 20,
    flexWrap: 'wrap',
  };
  return <div style={style} />;
}

function DividerBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    borderBottom: node.styles.borderBottom ?? '1px solid #e5e7eb',
    margin: typeof node.styles.margin === 'string' ? node.styles.margin : '24px 0',
    width: node.styles.width ?? '100%',
  };
  return <hr style={style} />;
}

function SpacerBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    height: typeof node.styles.height === 'number' ? `${node.styles.height}px` : (node.styles.height ?? 24),
    width: node.styles.width ?? '100%',
  };
  return <div style={style} />;
}

function VideoBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    width: node.styles.width ?? '100%',
    maxWidth: node.styles.maxWidth ?? 640,
    marginBottom: node.styles.marginBottom ?? 20,
    borderRadius: node.styles.borderRadius ?? 0,
  };
  return <iframe src={String(node.props.src ?? '')} title="Video" style={style} allowFullScreen />;
}

function FormFieldBlock({ node }: BlockProps) {
  const style: React.CSSProperties = {
    marginBottom: typeof node.styles.marginBottom === 'number' ? `${node.styles.marginBottom}px` : (node.styles.marginBottom ?? 16),
    width: node.styles.width ?? '100%',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
  };
  return (
    <div style={style}>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#333' }}>{String(node.props.label ?? 'Alan')}</label>
      {node.props.type === 'textarea' ? (
        <textarea style={inputStyle} />
      ) : (
        <input type={String(node.props.type ?? 'text')} style={inputStyle} />
      )}
    </div>
  );
}
