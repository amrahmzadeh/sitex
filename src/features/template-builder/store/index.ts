import type { EditorCommand, EditorState, Template, TemplateNode, NodeId } from '@/features/template-builder/types';
import { editorReducer, createHistoryManager, type HistoryManager } from './editorStore';

export interface EditorStore {
  state: EditorState;
  history: HistoryManager;
  dispatch(action: { type: string; payload: unknown }): void;
  subscribe(fn: () => void): () => void;
  getSelectedNode(): TemplateNode | undefined;
  getNode(id: NodeId): TemplateNode | undefined;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): void;
  redo(): void;
  addNode(node: TemplateNode, parentId: NodeId, index?: number): void;
  removeNode(id: NodeId): void;
  updateNode(id: NodeId, patch: Partial<TemplateNode>): void;
  moveNode(id: NodeId, parentId: NodeId, index: number): void;
  reorderChildren(parentId: NodeId, children: NodeId[]): void;
  setSelected(id: NodeId | null): void;
  setTemplate(template: Template): void;
  setDevice(device: 'desktop' | 'tablet' | 'mobile'): void;
  setClipboard(node: TemplateNode | null): void;
  markDirty(): void;
  reset(template: Template): void;
  toCommand(type: 'ADD_NODE' | 'REMOVE_NODE' | 'UPDATE_NODE' | 'MOVE_NODE' | 'SET_SELECTED' | 'REORDER_CHILDREN', payload: unknown, undoPayload: unknown): EditorCommand;
}

export function createEditorStore(initialTemplate: Template): EditorStore {
  const history = createHistoryManager(initialTemplate);

  let state: EditorState = {
    template: initialTemplate,
    selectedId: null,
    clipboard: null,
    device: 'desktop',
    history: [initialTemplate],
    historyIndex: 0,
    dirty: false,
  };

  let listeners: Array<() => void> = [];

  function dispatch(action: { type: string; payload: unknown }): void {
    const prev = state;
    state = editorReducer(state, action as never);
    if (state !== prev) {
      listeners.forEach((fn) => fn());
    }
  }

  function subscribe(fn: () => void) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }

  function getSelectedNode(): TemplateNode | undefined {
    return state.selectedId ? state.template.nodes.find((n) => n.id === state.selectedId) : undefined;
  }

  function getNode(id: NodeId): TemplateNode | undefined {
    return state.template.nodes.find((n) => n.id === id);
  }

  function canUndo(): boolean {
    return history.canUndo();
  }

  function canRedo(): boolean {
    return history.canRedo();
  }

  function undo(): void {
    const prev = history.undo();
    if (!prev) return;
    state = { ...state, template: prev, dirty: true };
    listeners.forEach((fn) => fn());
  }

  function redo(): void {
    const next = history.redo();
    if (!next) return;
    state = { ...state, template: next, dirty: true };
    listeners.forEach((fn) => fn());
  }

  function pushSnapshot(): void {
    history.push(state.template);
    state = { ...state, history: history.snapshots(), historyIndex: history.index() };
  }

  function addNode(node: TemplateNode, parentId: NodeId, index?: number): void {
    dispatch({ type: 'ADD_NODE', payload: { node, parentId, index } });
    pushSnapshot();
  }

  function removeNode(id: NodeId): void {
    dispatch({ type: 'REMOVE_NODE', payload: id });
    pushSnapshot();
  }

  function updateNode(id: NodeId, patch: Partial<TemplateNode>): void {
    dispatch({ type: 'UPDATE_NODE', payload: { id, patch } });
    pushSnapshot();
  }

  function moveNode(id: NodeId, parentId: NodeId, index: number): void {
    dispatch({ type: 'MOVE_NODE', payload: { id, parentId, index } });
    pushSnapshot();
  }

  function reorderChildren(parentId: NodeId, children: NodeId[]): void {
    dispatch({ type: 'REORDER_CHILDREN', payload: { parentId, children } });
    pushSnapshot();
  }

  function setSelected(id: NodeId | null): void {
    dispatch({ type: 'SET_SELECTED', payload: id });
  }

  function setTemplate(template: Template): void {
    dispatch({ type: 'SET_TEMPLATE', payload: template });
    state = { ...state, history: [template], historyIndex: 0, dirty: false };
    listeners.forEach((fn) => fn());
  }

  function setDevice(device: 'desktop' | 'tablet' | 'mobile'): void {
    dispatch({ type: 'SET_DEVICE', payload: device });
  }

  function setClipboard(node: TemplateNode | null): void {
    dispatch({ type: 'SET_CLIPBOARD', payload: node });
  }

  function markDirty(): void {
    dispatch({ type: 'SET_DIRTY', payload: true });
  }

  function reset(template: Template): void {
    state = {
      template,
      selectedId: null,
      clipboard: null,
      device: 'desktop',
      history: [template],
      historyIndex: 0,
      dirty: false,
    };
    history.reset(template);
    listeners.forEach((fn) => fn());
  }

  function toCommand(
    type: 'ADD_NODE' | 'REMOVE_NODE' | 'UPDATE_NODE' | 'MOVE_NODE' | 'SET_SELECTED' | 'REORDER_CHILDREN',
    payload: unknown,
    undoPayload: unknown
  ): EditorCommand {
    return { id: crypto.randomUUID(), type, payload, undoPayload };
  }

  return {
    get state() {
      return state;
    },
    history,
    dispatch,
    subscribe,
    getSelectedNode,
    getNode,
    canUndo,
    canRedo,
    undo,
    redo,
    addNode,
    removeNode,
    updateNode,
    moveNode,
    reorderChildren,
    setSelected,
    setTemplate,
    setDevice,
    setClipboard,
    markDirty,
    reset,
    toCommand,
  };
}

export type { EditorState, TemplateNode };
