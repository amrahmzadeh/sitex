import assert from 'node:assert/strict';
import * as React from 'react';
import { test } from 'node:test';
import { createEditorStore } from '@/features/template-builder/store';
import { createEmptyTemplate } from '@/features/template-builder/store/editorStore';
import { blockRegistry, registerBlock } from '@/features/template-builder/registry/blockRegistry';
import { serializeTemplate, deserializeTemplate } from '@/features/template-builder/utils/serialize';
import type { BlockDefinition, TemplateNode } from '@/features/template-builder/types';

function makeBlock(type: string): BlockDefinition {
  const Component: React.ComponentType<{ node: TemplateNode; selected: boolean; onSelect: (id: string) => void; onUpdate: (patch: Partial<TemplateNode>) => void }> = () => null;
  return {
    type,
    name: type,
    component: Component,
    defaultProps: {},
    defaultStyles: {},
    schema: [],
    isContainer: false,
    canHaveChildren: false,
  };
}

test('store: add node to root', () => {
  const store = createEditorStore(createEmptyTemplate('t1', 'Test'));
  const node: TemplateNode = { id: 'n1', type: 'text', props: {}, styles: {}, children: [] };
  store.addNode(node, 'root');
  const root = store.getNode('root')!;
  assert.ok(root.children.includes('n1'));
  assert.ok(store.getNode('n1'));
  assert.equal(store.state.selectedId, 'n1');
  assert.equal(store.state.dirty, true);
});

test('store: undo add node removes it', () => {
  const store = createEditorStore(createEmptyTemplate('t1', 'Test'));
  const node: TemplateNode = { id: 'n1', type: 'text', props: {}, styles: {}, children: [] };
  store.addNode(node, 'root');
  assert.equal(store.state.template.nodes.length, 2);
  store.undo();
  assert.equal(store.state.template.nodes.length, 1);
  assert.equal(store.getNode('n1'), undefined);
});

test('store: redo restores node after undo', () => {
  const store = createEditorStore(createEmptyTemplate('t1', 'Test'));
  const node: TemplateNode = { id: 'n1', type: 'text', props: {}, styles: {}, children: [] };
  store.addNode(node, 'root');
  store.undo();
  store.redo();
  assert.equal(store.state.template.nodes.length, 2);
  assert.ok(store.getNode('n1'));
});

test('store: cannot undo past beginning', () => {
  const store = createEditorStore(createEmptyTemplate('t1', 'Test'));
  assert.equal(store.canUndo(), false);
  store.undo();
  assert.equal(store.state.template.nodes.length, 1);
});

test('store: cannot redo past end', () => {
  const store = createEditorStore(createEmptyTemplate('t1', 'Test'));
  assert.equal(store.canRedo(), false);
  store.redo();
  assert.equal(store.state.template.nodes.length, 1);
});

test('store: remove node', () => {
  const store = createEditorStore(createEmptyTemplate('t1', 'Test'));
  const node: TemplateNode = { id: 'n1', type: 'text', props: {}, styles: {}, children: [] };
  store.addNode(node, 'root');
  store.removeNode('n1');
  assert.equal(store.getNode('n1'), undefined);
  assert.ok(!store.getNode('root')!.children.includes('n1'));
});

test('store: update node', () => {
  const store = createEditorStore(createEmptyTemplate('t1', 'Test'));
  const node: TemplateNode = { id: 'n1', type: 'text', props: { content: 'a' }, styles: {}, children: [] };
  store.addNode(node, 'root');
  store.updateNode('n1', { props: { content: 'b' } });
  assert.equal(store.getNode('n1')?.props.content, 'b');
});

test('registry: register and get block', () => {
  const block = makeBlock('custom-block');
  registerBlock(block);
  const got = blockRegistry.get('custom-block');
  assert.ok(got);
  assert.equal(got.type, 'custom-block');
  assert.equal(blockRegistry.has('custom-block'), true);
  assert.equal(blockRegistry.get('nope'), undefined);
});

test('registry: getAll returns registered blocks', () => {
  const before = blockRegistry.getAll().length;
  registerBlock(makeBlock('block-a'));
  registerBlock(makeBlock('block-b'));
  assert.equal(blockRegistry.getAll().length, before + 2);
});

test('serialize: round trip preserves structure', () => {
  const template = createEmptyTemplate('t1', 'Test');
  template.nodes.push({ id: 'n1', type: 'text', props: { content: 'merhaba' }, styles: { fontSize: 16 }, children: [] });
  const json = serializeTemplate(template);
  const back = deserializeTemplate(json);
  assert.equal(back.id, 't1');
  assert.equal(back.nodes.length, 2);
  assert.equal(back.nodes[1].props.content, 'merhaba');
  assert.equal(back.nodes[1].styles.fontSize, 16);
});

test('serialize: invalid JSON throws', () => {
  assert.throws(() => deserializeTemplate('{not json}'), /Invalid template JSON/);
});

test('createEmptyTemplate: root node exists', () => {
  const t = createEmptyTemplate('t1', 'Test');
  assert.equal(t.nodes.length, 1);
  assert.equal(t.nodes[0].id, 'root');
  assert.equal(t.version, '1.0.0');
});
