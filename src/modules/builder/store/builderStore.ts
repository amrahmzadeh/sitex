'use client';

import { useState, useCallback, useRef } from 'react';
import { BuilderNode, DeviceMode, BuilderTemplateDocument } from '../types';
import { getComponent } from '../registry/componentRegistry';

export function useBuilderStore(initialDoc?: Partial<BuilderTemplateDocument>) {
  const [doc, setDoc] = useState<BuilderTemplateDocument>({
    id: initialDoc?.id || 'custom-theme-' + Date.now(),
    name: initialDoc?.name || 'Mənim Yeni Temam',
    slug: initialDoc?.slug || 'menim-yeni-temam',
    description: initialDoc?.description || 'Builder vasitəsilə yaradılmış unikal tema.',
    version: initialDoc?.version || '1.0.0',
    tokens: initialDoc?.tokens || {},
    nodes: initialDoc?.nodes || [
      {
        id: 'node-nav-1',
        type: 'navbar',
        props: { brandName: 'Restoranınız', links: 'Menyu, Haqqımızda, Əlaqə', bgColor: '#111315', textColor: '#F5F5F7', ctaText: 'Sifariş Ver' },
      },
      {
        id: 'node-hero-1',
        type: 'hero',
        props: { title: 'Xüsusi Dadlar və İsti Mühit', subtitle: 'Ən dadlı yeməklər sizi gözləyir', buttonText: 'Menyuya Bax', align: 'center' },
      },
      {
        id: 'node-menu-1',
        type: 'menu_list',
        props: { title: 'Populyar Təamlar', items: 'Lülə Kebab - 12 AZN, Qutab - 3 AZN, Şah Plov - 25 AZN' },
      },
      {
        id: 'node-footer-1',
        type: 'footer',
        props: { copyright: '© 2026 Restoranınız. Bütün hüquqlar qorunur.', poweredBy: 'SiteX', bgColor: '#0C0E10', textColor: '#8888A0' },
      },
    ],
    updatedAt: new Date().toISOString(),
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  
  // History for Undo/Redo
  const [history, setHistory] = useState<BuilderNode[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const pushHistory = useCallback((newNodes: BuilderNode[]) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newNodes];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const setNodesWithHistory = useCallback((updater: (prev: BuilderNode[]) => BuilderNode[]) => {
    setDoc((prevDoc) => {
      const nextNodes = updater(prevDoc.nodes);
      pushHistory(prevDoc.nodes);
      return { ...prevDoc, nodes: nextNodes, updatedAt: new Date().toISOString() };
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      setHistoryIndex((idx) => idx - 1);
      setDoc((d) => ({ ...d, nodes: targetState }));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      setDoc((d) => ({ ...d, nodes: targetState }));
    }
  }, [history, historyIndex]);

  const addNode = useCallback((type: string, targetIndex?: number) => {
    const compDef = getComponent(type);
    const newNode: BuilderNode = {
      id: `node-${type}-${Date.now()}`,
      type,
      props: compDef ? { ...compDef.defaultProps } : {},
    };

    setNodesWithHistory((nodes) => {
      const copy = [...nodes];
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        copy.splice(targetIndex, 0, newNode);
      } else {
        copy.push(newNode);
      }
      return copy;
    });
    setSelectedNodeId(newNode.id);
  }, [setNodesWithHistory]);

  const updateNodeProps = useCallback((id: string, newProps: Record<string, any>) => {
    setDoc((d) => ({
      ...d,
      nodes: d.nodes.map((n) => (n.id === id ? { ...n, props: { ...n.props, ...newProps } } : n)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const moveNode = useCallback((id: string, direction: 'up' | 'down') => {
    setNodesWithHistory((nodes) => {
      const idx = nodes.findIndex((n) => n.id === id);
      if (idx === -1) return nodes;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= nodes.length) return nodes;

      const copy = [...nodes];
      const [item] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, item);
      return copy;
    });
  }, [setNodesWithHistory]);

  const reorderNodes = useCallback((startIndex: number, endIndex: number) => {
    setNodesWithHistory((nodes) => {
      const copy = [...nodes];
      const [removed] = copy.splice(startIndex, 1);
      copy.splice(endIndex, 0, removed);
      return copy;
    });
  }, [setNodesWithHistory]);

  const duplicateNode = useCallback((id: string) => {
    setNodesWithHistory((nodes) => {
      const idx = nodes.findIndex((n) => n.id === id);
      if (idx === -1) return nodes;
      const source = nodes[idx];
      const clone: BuilderNode = {
        ...source,
        id: `node-${source.type}-${Date.now()}`,
        props: JSON.parse(JSON.stringify(source.props)),
      };
      const copy = [...nodes];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
  }, [setNodesWithHistory]);

  const deleteNode = useCallback((id: string) => {
    setNodesWithHistory((nodes) => nodes.filter((n) => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [setNodesWithHistory, selectedNodeId]);

  return {
    doc,
    setDoc,
    nodes: doc.nodes,
    selectedNodeId,
    setSelectedNodeId,
    device,
    setDevice,
    addNode,
    updateNodeProps,
    moveNode,
    reorderNodes,
    duplicateNode,
    deleteNode,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
}
