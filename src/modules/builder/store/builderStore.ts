'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  BuilderNode,
  DeviceMode,
  BuilderTemplateDocument,
  BuilderActiveMode,
  GlobalDesignTokens,
  ThemeVersionSnapshot,
} from '../types';
import { getComponent } from '../registry/componentRegistry';
import {
  DEFAULT_DESIGN_TOKENS,
  designTokensToSTL,
  stlToDesignTokens,
  serializeTemplateToTheme,
} from '../serializer';
import { parseSTL, compileSTL } from '../../stl';
import { ThemeDefinition } from '../../themes/types';

const INITIAL_NODES: BuilderNode[] = [
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
];

export function useBuilderStore(initialDoc?: Partial<BuilderTemplateDocument>) {
  const [activeMode, setActiveMode] = useState<BuilderActiveMode>('visual');
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [doc, setDoc] = useState<BuilderTemplateDocument>(() => {
    const baseTokens = initialDoc?.designTokens || DEFAULT_DESIGN_TOKENS;
    const initialDocObj: BuilderTemplateDocument = {
      id: initialDoc?.id || 'custom-theme-' + Date.now(),
      name: initialDoc?.name || 'Mənim Yeni Temam',
      slug: initialDoc?.slug || 'menim-yeni-temam',
      description: initialDoc?.description || 'SiteX Theme Builder ilə yaradılmış müasir tema.',
      version: initialDoc?.version || '1.0.0',
      tokens: initialDoc?.tokens || {},
      designTokens: baseTokens,
      nodes: initialDoc?.nodes || INITIAL_NODES,
      updatedAt: new Date().toISOString(),
    };
    initialDocObj.stlCode = designTokensToSTL(initialDocObj, baseTokens);
    return initialDocObj;
  });

  const [stlCode, setStlCode] = useState<string>(() => {
    return doc.stlCode || designTokensToSTL(doc, doc.designTokens || DEFAULT_DESIGN_TOKENS);
  });

  const [compiledCss, setCompiledCss] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Undo / Redo history
  const [history, setHistory] = useState<BuilderNode[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Version Snapshots
  const [versions, setVersions] = useState<ThemeVersionSnapshot[]>(() => {
    return [
      {
        id: 'v-init',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        note: 'İlkin tema versiyası',
        stlCode: designTokensToSTL(doc, doc.designTokens || DEFAULT_DESIGN_TOKENS),
        doc,
      },
    ];
  });

  // Keep compiledCss up to date
  useEffect(() => {
    const { ast } = parseSTL(stlCode);
    if (ast) {
      const compiled = compileSTL(ast);
      setCompiledCss(compiled.compiledCss);
    }
  }, [stlCode]);

  // History push
  const pushHistory = useCallback(
    (newNodes: BuilderNode[]) => {
      setHistory((prev) => {
        const upToCurrent = prev.slice(0, historyIndex + 1);
        return [...upToCurrent, newNodes];
      });
      setHistoryIndex((prev) => prev + 1);
      setHasUnsavedChanges(true);
    },
    [historyIndex]
  );

  const setNodesWithHistory = useCallback(
    (updater: (prev: BuilderNode[]) => BuilderNode[]) => {
      setDoc((prevDoc) => {
        const nextNodes = updater(prevDoc.nodes);
        pushHistory(prevDoc.nodes);
        return { ...prevDoc, nodes: nextNodes, updatedAt: new Date().toISOString() };
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const targetState = history[historyIndex - 1];
      setHistoryIndex((idx) => idx - 1);
      setDoc((d) => ({ ...d, nodes: targetState }));
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetState = history[historyIndex + 1];
      setHistoryIndex((idx) => idx + 1);
      setDoc((d) => ({ ...d, nodes: targetState }));
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  // Update Visual Tokens -> Auto sync to STL Code
  const updateDesignTokens = useCallback(
    (newTokens: GlobalDesignTokens) => {
      setDoc((prev) => {
        const nextDoc = {
          ...prev,
          designTokens: newTokens,
          updatedAt: new Date().toISOString(),
        };
        const nextStl = designTokensToSTL(nextDoc, newTokens);
        setStlCode(nextStl);
        return nextDoc;
      });
      setHasUnsavedChanges(true);
    },
    []
  );

  // Update STL Code -> Auto sync to Visual Tokens
  const updateSTLCode = useCallback((newCode: string) => {
    setStlCode(newCode);
    setHasUnsavedChanges(true);

    const { ast } = parseSTL(newCode);
    if (ast) {
      const tokens = stlToDesignTokens(newCode);
      setDoc((prev) => ({
        ...prev,
        name: ast.meta.name || prev.name,
        description: ast.meta.description || prev.description,
        version: ast.meta.version || prev.version,
        designTokens: tokens,
        stlCode: newCode,
        updatedAt: new Date().toISOString(),
      }));
    }
  }, []);

  // Node operations
  const addNode = useCallback(
    (type: string, targetIndex?: number) => {
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
    },
    [setNodesWithHistory]
  );

  const updateNodeProps = useCallback(
    (id: string, newProps: Record<string, any>) => {
      setDoc((d) => ({
        ...d,
        nodes: d.nodes.map((n) => (n.id === id ? { ...n, props: { ...n.props, ...newProps } } : n)),
        updatedAt: new Date().toISOString(),
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  const moveNode = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setNodesWithHistory((nodes) => {
        const index = nodes.findIndex((n) => n.id === id);
        if (index === -1) return nodes;
        if (direction === 'up' && index === 0) return nodes;
        if (direction === 'down' && index === nodes.length - 1) return nodes;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const copy = [...nodes];
        const [moved] = copy.splice(index, 1);
        copy.splice(targetIndex, 0, moved);
        return copy;
      });
    },
    [setNodesWithHistory]
  );

  const duplicateNode = useCallback(
    (id: string) => {
      setNodesWithHistory((nodes) => {
        const index = nodes.findIndex((n) => n.id === id);
        if (index === -1) return nodes;
        const target = nodes[index];
        const copyNode: BuilderNode = {
          ...target,
          id: `node-${target.type}-${Date.now()}`,
          props: JSON.parse(JSON.stringify(target.props)),
        };
        const copy = [...nodes];
        copy.splice(index + 1, 0, copyNode);
        return copy;
      });
    },
    [setNodesWithHistory]
  );

  const deleteNode = useCallback(
    (id: string) => {
      setNodesWithHistory((nodes) => nodes.filter((n) => n.id !== id));
      if (selectedNodeId === id) setSelectedNodeId(null);
    },
    [selectedNodeId, setNodesWithHistory]
  );

  // Create Snapshot
  const createSnapshot = useCallback(
    (note: string) => {
      const snap: ThemeVersionSnapshot = {
        id: 'ver-' + Date.now(),
        version: doc.version || '1.0.0',
        createdAt: new Date().toISOString(),
        note,
        stlCode,
        doc,
      };
      setVersions((prev) => [snap, ...prev]);
    },
    [doc, stlCode]
  );

  // Restore Snapshot
  const restoreSnapshot = useCallback((snapshot: ThemeVersionSnapshot) => {
    setDoc(snapshot.doc);
    setStlCode(snapshot.stlCode);
    setHasUnsavedChanges(false);
  }, []);

  // Load a ThemeDefinition into the Builder
  const loadThemeDefinition = useCallback((themeDef: ThemeDefinition) => {
    const tokens: GlobalDesignTokens = {
      ...DEFAULT_DESIGN_TOKENS,
      colors: {
        primary: themeDef.tokens.colors.primary,
        secondary: themeDef.tokens.colors.secondary,
        accent: themeDef.tokens.colors.accent,
        background: themeDef.tokens.colors.background,
        surface: themeDef.tokens.colors.background,
        text: themeDef.tokens.colors.text,
      },
      typography: {
        headingFont: themeDef.tokens.typography.headingFont,
        bodyFont: themeDef.tokens.typography.bodyFont,
        baseSize: '16px',
      },
      layout: {
        containerWidth: '1200px',
        borderRadius: themeDef.tokens.radius.borderRadius,
        spacing: '16px',
        shadowStyle: 'medium',
      },
    };

    const newDoc: BuilderTemplateDocument = {
      id: themeDef.id,
      name: themeDef.name,
      slug: themeDef.slug,
      description: themeDef.description,
      version: themeDef.version,
      tokens: themeDef.tokens,
      designTokens: tokens,
      nodes: themeDef.tokens.customProps?.builderNodes || INITIAL_NODES,
      updatedAt: new Date().toISOString(),
    };

    const newStl = designTokensToSTL(newDoc, tokens);
    setDoc(newDoc);
    setStlCode(newStl);
    setHasUnsavedChanges(false);
  }, []);

  return {
    doc,
    setDoc,
    stlCode,
    setStlCode: updateSTLCode,
    designTokens: doc.designTokens || DEFAULT_DESIGN_TOKENS,
    updateDesignTokens,
    nodes: doc.nodes,
    selectedNodeId,
    setSelectedNodeId,
    device,
    setDevice,
    activeMode,
    setActiveMode,
    compiledCss,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    addNode,
    updateNodeProps,
    moveNode,
    duplicateNode,
    deleteNode,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    versions,
    createSnapshot,
    restoreSnapshot,
    loadThemeDefinition,
  };
}
