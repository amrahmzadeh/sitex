export type NodeId = string;
export type TemplateId = string;

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface NodeStyle {
  width?: string | number;
  height?: string | number;
  minHeight?: string | number;
  padding?: string | number;
  margin?: string | number;
  backgroundColor?: string;
  color?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string | number;
  border?: string;
  borderBottom?: string;
  display?: string;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  gap?: string | number;
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  cursor?: string;
  maxWidth?: string | number;
  [key: string]: string | number | undefined;
}

export interface NodeProps {
  [key: string]: unknown;
}

export interface TemplateNode {
  id: NodeId;
  type: string;
  props: NodeProps;
  styles: NodeStyle;
  children: NodeId[];
}

export interface Template {
  id: TemplateId;
  name: string;
  version: string;
  nodes: TemplateNode[];
}

export interface BlockSchemaField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'boolean' | 'image' | 'url';
  default?: unknown;
  options?: { label: string; value: unknown }[];
  required?: boolean;
}

export interface BlockDefinition {
  type: string;
  name: string;
  component: React.ComponentType<{ node: TemplateNode; selected: boolean; onSelect: (id: NodeId) => void; onUpdate: (patch: Partial<TemplateNode>) => void }>;
  defaultProps: NodeProps;
  defaultStyles: NodeStyle;
  schema: BlockSchemaField[];
  isContainer: boolean;
  canHaveChildren: boolean;
  acceptChildren?: string[]; // undefined = all
}

export interface BlockRegistry {
  register(block: BlockDefinition): void;
  get(type: string): BlockDefinition | undefined;
  getAll(): BlockDefinition[];
  has(type: string): boolean;
}

export interface TemplateRepository {
  list(): Promise<Template[]>;
  get(id: TemplateId): Promise<Template | null>;
  save(template: Template): Promise<void>;
  delete(id: TemplateId): Promise<void>;
}

export interface EditorCommand {
  id: string;
  type: 'ADD_NODE' | 'REMOVE_NODE' | 'UPDATE_NODE' | 'MOVE_NODE' | 'SET_SELECTED' | 'REORDER_CHILDREN';
  payload: unknown;
  undoPayload: unknown;
}

export interface EditorState {
  template: Template;
  selectedId: NodeId | null;
  clipboard: TemplateNode | null;
  device: DeviceType;
  history: Template[];
  historyIndex: number;
  dirty: boolean;
}

export interface PersistedTemplate {
  id: TemplateId;
  name: string;
  version: string;
  nodes: TemplateNode[];
  updatedAt: string;
}
