'use client';

import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { TopBar } from './TopBar';
import { VisualThemeBuilder } from './VisualThemeBuilder';
import { STLEditor } from './STLEditor';
import { LivePreviewEngine } from './LivePreviewEngine';
import { ThemeManager } from './ThemeManager';
import { AssetsManager } from './AssetsManager';
import { VersionHistory } from './VersionHistory';
import { ImportExportModal } from './ImportExportModal';
import { serializeTemplateToTheme, importTemplateFromJSON } from '../serializer';
import { parseSTL, compileSTL } from '../../stl';

export function BuilderEditor() {
  const {
    doc,
    setDoc,
    stlCode,
    setStlCode,
    designTokens,
    updateDesignTokens,
    nodes,
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
    canUndo,
    canRedo,
    versions,
    createSnapshot,
    restoreSnapshot,
    pruneSnapshots,
    loadThemeDefinition,
  } = useBuilderStore();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  // Retrieve current organization ID
  useEffect(() => {
    const savedOrg = localStorage.getItem('currentOrgId');
    if (savedOrg) {
      setOrgId(savedOrg);
      return;
    }
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.[0]?.id) {
          setOrgId(d.organizations[0].id);
          localStorage.setItem('currentOrgId', d.organizations[0].id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Save Theme Action
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const themePayload = serializeTemplateToTheme(doc);

      // Save to Theme Registry
      await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themePayload),
      });

      // Also save to active organization website draftTheme if orgId is available
      if (orgId) {
        await fetch(`/api/organizations/${orgId}/theme`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: {
              id: doc.id,
              name: doc.name,
              primaryColor: designTokens.colors.primary,
              secondaryColor: designTokens.colors.secondary,
              accentColor: designTokens.colors.accent,
              backgroundColor: designTokens.colors.background,
              textColor: designTokens.colors.text,
              headingFont: designTokens.typography.headingFont,
              bodyFont: designTokens.typography.bodyFont,
              borderRadius: designTokens.layout.borderRadius,
              buttonStyle: designTokens.components.button.style,
              cardStyle: designTokens.components.card.style,
              headerStyle: designTokens.header.style,
              footerStyle: designTokens.footer.style,
            },
          }),
        });
      }

      // Record snapshot
      createSnapshot(`Yadda saxlanıldı: ${doc.name}`);

      setSaved(true);
      setHasUnsavedChanges(false);
      setSaveMessage('Tema uğurla yadda saxlanıldı!');
      setTimeout(() => {
        setSaved(false);
        setSaveMessage('');
      }, 3500);
    } catch (err: any) {
      console.error(err);
      alert('Yadda saxlanılarkən xəta: ' + (err.message || 'Xəta baş verdi'));
    } finally {
      setSaving(false);
    }
  };

  // STL Import handler
  const handleImportSTL = (code: string) => {
    setStlCode(code);
  };

  // JSON Import handler
  const handleImportJSON = (jsonString: string) => {
    const importedDoc = importTemplateFromJSON(jsonString);
    setDoc(importedDoc);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: '#0D0E11', overflow: 'hidden' }}>
      {/* TopBar */}
      <TopBar
        templateName={doc.name}
        onUpdateName={(name) => setDoc((d) => ({ ...d, name, slug: name.toLowerCase().replace(/\s+/g, '-') }))}
        activeMode={activeMode}
        onSetActiveMode={setActiveMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onExport={() => setShowImportExport(true)}
        onImport={() => setShowImportExport(true)}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Workspace Mode View */}
      {activeMode === 'visual' && (
        <VisualThemeBuilder
          tokens={designTokens}
          onUpdateTokens={updateDesignTokens}
          nodes={nodes}
          onUpdateNodes={(newNodes) => setDoc((d) => ({ ...d, nodes: newNodes }))}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          device={device}
          onSetDevice={setDevice}
          onAddNode={addNode}
          onDuplicateNode={duplicateNode}
          onDeleteNode={deleteNode}
          onMoveNode={moveNode}
          onUpdateNodeProps={updateNodeProps}
        />
      )}

      {activeMode === 'code' && (
        <STLEditor
          code={stlCode}
          onChangeCode={setStlCode}
          onApplyTheme={(css) => {
            // Live applied
          }}
          onSave={handleSave}
          onSwitchMode={setActiveMode}
        />
      )}

      {activeMode === 'preview' && (
        <LivePreviewEngine
          tokens={designTokens}
          compiledCss={compiledCss}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      )}

      {activeMode === 'themes' && (
        <ThemeManager
          currentThemeId={doc.id}
          onSelectTheme={loadThemeDefinition}
          onOpenVisualBuilder={() => setActiveMode('visual')}
          onOpenCodeEditor={() => setActiveMode('code')}
          onExportTheme={() => setShowImportExport(true)}
          onImportTheme={() => setShowImportExport(true)}
          orgId={orgId}
        />
      )}

      {activeMode === 'assets' && (
        <AssetsManager
          orgId={orgId}
          onSelectAsset={(url) => {
            alert(`Aktiv URL seçildi: ${url}`);
          }}
        />
      )}

      {activeMode === 'history' && (
        <VersionHistory
          versions={versions}
          onRestoreVersion={restoreSnapshot}
          onCreateSnapshot={createSnapshot}
          onPruneSnapshots={pruneSnapshots}
        />
      )}

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        stlCode={stlCode}
        doc={doc}
        onImportSTL={handleImportSTL}
        onImportJSON={handleImportJSON}
      />
    </div>
  );
}
