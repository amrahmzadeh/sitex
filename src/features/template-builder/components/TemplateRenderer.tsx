'use client';

import { useBlockRegistry } from '@/features/template-builder/hooks/useRegistry';
import type { BlockDefinition, Template, TemplateNode } from '@/features/template-builder/types';

export interface TemplateRendererProps {
  template: Template;
  className?: string;
  style?: React.CSSProperties;
}

export function TemplateRenderer({ template, className, style }: TemplateRendererProps) {
  const { blocks } = useBlockRegistry();
  const nodeMap = buildNodeMap(template.nodes);

  return (
    <div className={className} style={style}>
      {renderRoots(template.nodes, blocks, nodeMap)}
    </div>
  );
}

function buildNodeMap(nodes: TemplateNode[]): Map<string, TemplateNode> {
  const map = new Map<string, TemplateNode>();
  for (const node of nodes) map.set(node.id, node);
  return map;
}

function renderRoots(nodes: TemplateNode[], blocks: BlockDefinition[], nodeMap: Map<string, TemplateNode>): React.ReactNode {
  // Roots are nodes not referenced as children of any node
  const childIds = new Set<string>();
  for (const node of nodes) for (const cid of node.children) childIds.add(cid);
  const roots = nodes.filter((n) => !childIds.has(n.id));
  return roots.map((node) => renderNode(node, blocks, nodeMap));
}

function renderNode(node: TemplateNode, blocks: BlockDefinition[], nodeMap: Map<string, TemplateNode>): React.ReactNode {
  const blockDef = blocks.find((b) => b.type === node.type);
  const children = node.children.map((cid) => {
    const child = nodeMap.get(cid);
    return child ? renderNode(child, blocks, nodeMap) : null;
  });

  if (!blockDef) {
    return (
      <div key={node.id} style={{ color: '#9ca3af', fontSize: 12, padding: 8 }}>
        (bilinmeyen blok: {node.type})
      </div>
    );
  }

  return (
    <div key={node.id} style={{ display: 'contents' }}>
      <blockDef.component
        node={node}
        selected={false}
        onSelect={() => {}}
        onUpdate={() => {}}
      />
      {children.length > 0 && (
        <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px dashed #cbd5e1' }}>{children}</div>
      )}
    </div>
  );
}

export default TemplateRenderer;
