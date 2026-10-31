import type { EditorState, Template, TemplateNode, NodeId, TemplateId } from '@/features/template-builder/types';

export const INITIAL_VERSION = '1.0.0';

export function createRootNode(): TemplateNode {
  return {
    id: 'root',
    type: 'container',
    props: {},
    styles: { width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 0 },
    children: [],
  };
}

export function createEmptyTemplate(id: TemplateId, name: string): Template {
  return {
    id,
    name,
    version: INITIAL_VERSION,
    nodes: [createRootNode()],
  };
}

export function findNodeIndex(nodes: TemplateNode[], id: NodeId): number {
  return nodes.findIndex((n) => n.id === id);
}

export function findNode(nodes: TemplateNode[], id: NodeId): TemplateNode | undefined {
  return nodes.find((n) => n.id === id);
}

export function findNodeParent(nodes: TemplateNode[], targetId: NodeId): TemplateNode | undefined {
  for (const node of nodes) {
    if (node.children.includes(targetId)) return node;
    for (const childId of node.children) {
      const child = nodes.find((n) => n.id === childId);
      if (child) {
        const found = findNodeParent([child], targetId);
        if (found) return found;
      }
    }
  }
  return undefined;
}

export function removeNodeRecursive(nodes: TemplateNode[], id: NodeId): TemplateNode[] {
  const result: TemplateNode[] = [];
  for (const node of nodes) {
    if (node.id === id) continue;
    const children: NodeId[] = [];
    for (const childId of node.children) {
      if (childId !== id) children.push(childId);
    }
    result.push({ ...node, children });
  }
  return result;
}

export interface EditorReducerAction {
  type:
    | 'SET_TEMPLATE'
    | 'ADD_NODE'
    | 'REMOVE_NODE'
    | 'UPDATE_NODE'
    | 'MOVE_NODE'
    | 'SET_SELECTED'
    | 'REORDER_CHILDREN'
    | 'SET_CLIPBOARD'
    | 'SET_DEVICE'
    | 'SET_DIRTY'
    | 'UNDO'
    | 'REDO';
  payload: unknown;
}

export function editorReducer(state: EditorState, action: EditorReducerAction): EditorState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload as Template, selectedId: null, dirty: false };
    case 'SET_SELECTED':
      return { ...state, selectedId: action.payload as NodeId | null };
    case 'SET_CLIPBOARD':
      return { ...state, clipboard: action.payload as TemplateNode | null };
    case 'SET_DEVICE':
      return { ...state, device: action.payload as 'desktop' | 'tablet' | 'mobile' };
    case 'SET_DIRTY':
      return { ...state, dirty: Boolean(action.payload) };
    case 'ADD_NODE': {
      const { node, parentId, index } = action.payload as {
        node: TemplateNode;
        parentId: NodeId;
        index?: number;
      };
      const nodes = [...state.template.nodes];
      const parentIdx = findNodeIndex(nodes, parentId);
      if (parentIdx === -1) return state;
      const parent = nodes[parentIdx];
      const insertAt = index !== undefined ? index : parent.children.length;
      const updatedChildren = [...parent.children];
      updatedChildren.splice(insertAt, 0, node.id);
      nodes[parentIdx] = { ...parent, children: updatedChildren };
      nodes.push(node);
      return {
        ...state,
        template: { ...state.template, nodes },
        selectedId: node.id,
        dirty: true,
      };
    }
    case 'REMOVE_NODE': {
      const id = action.payload as NodeId;
      if (id === 'root') return state;
      const nodes = removeNodeRecursive(state.template.nodes, id);
      return {
        ...state,
        template: { ...state.template, nodes },
        selectedId: state.selectedId === id ? null : state.selectedId,
        dirty: true,
      };
    }
    case 'UPDATE_NODE': {
      const { id, patch } = action.payload as { id: NodeId; patch: Partial<TemplateNode> };
      const nodes = [...state.template.nodes];
      const idx = findNodeIndex(nodes, id);
      if (idx === -1) return state;
      nodes[idx] = { ...nodes[idx], ...patch };
      return { ...state, template: { ...state.template, nodes }, dirty: true };
    }
    case 'MOVE_NODE': {
      const { id, parentId, index } = action.payload as {
        id: NodeId;
        parentId: NodeId;
        index: number;
      };
      const nodes = [...state.template.nodes];
      const nodeIdx = findNodeIndex(nodes, id);
      const parentIdx = findNodeIndex(nodes, parentId);
      if (nodeIdx === -1 || parentIdx === -1) return state;
      const node = nodes[nodeIdx];
      const parent = nodes[parentIdx];

      const oldParent = findNodeParent(nodes, id);
      if (oldParent) {
        const oldIdx = findNodeIndex(nodes, oldParent.id);
        nodes[oldIdx] = {
          ...oldParent,
          children: oldParent.children.filter((cid) => cid !== id),
        };
      }

      const updatedChildren = [...parent.children];
      updatedChildren.splice(index, 0, id);
      nodes[parentIdx] = { ...parent, children: updatedChildren };
      nodes[nodeIdx] = { ...node };

      return { ...state, template: { ...state.template, nodes }, dirty: true };
    }
    case 'REORDER_CHILDREN': {
      const { parentId, children } = action.payload as { parentId: NodeId; children: NodeId[] };
      const nodes = [...state.template.nodes];
      const idx = findNodeIndex(nodes, parentId);
      if (idx === -1) return state;
      nodes[idx] = { ...nodes[idx], children };
      return { ...state, template: { ...state.template, nodes }, dirty: true };
    }
    case 'UNDO': {
      const { history, historyIndex } = state;
      if (historyIndex <= 0) return state;
      const prev = history[historyIndex - 1];
      return { ...state, template: prev, historyIndex: historyIndex - 1, dirty: true };
    }
    case 'REDO': {
      const { history, historyIndex } = state;
      if (historyIndex >= history.length) return state;
      const next = history[historyIndex];
      return { ...state, template: next, historyIndex: historyIndex + 1, dirty: true };
    }
    default:
      return state;
  }
}

export interface HistoryManager {
  push(template: Template): void;
  undo(): Template | null;
  redo(): Template | null;
  canUndo(): boolean;
  canRedo(): boolean;
  snapshots(): Template[];
  index(): number;
  reset(template: Template): void;
}

export function createHistoryManager(initialTemplate: Template): HistoryManager {
  let snapshots: Template[] = [initialTemplate];
  let index = 0;

  return {
    push(template: Template) {
      snapshots = snapshots.slice(0, index + 1);
      snapshots.push(template);
      index += 1;
    },
    undo(): Template | null {
      if (index <= 0) return null;
      index -= 1;
      return snapshots[index];
    },
    redo(): Template | null {
      if (index >= snapshots.length - 1) return null;
      index += 1;
      return snapshots[index];
    },
    canUndo(): boolean {
      return index > 0;
    },
    canRedo(): boolean {
      return index < snapshots.length - 1;
    },
    snapshots(): Template[] {
      return snapshots;
    },
    index(): number {
      return index;
    },
    reset(template: Template) {
      snapshots = [template];
      index = 0;
    },
  };
}
