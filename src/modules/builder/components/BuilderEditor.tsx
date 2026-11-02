'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import '../registry/builtinComponents';

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

  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showImportExport, setShowImportExport] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<{ name: string; isPublished: boolean } | null>(null);

  // Retrieve current organization ID and details
  useEffect(() => {
    const savedOrg = localStorage.getItem('currentOrgId');
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.length) {
          const found = savedOrg
            ? d.organizations.find((o: any) => o.id === savedOrg) || d.organizations[0]
            : d.organizations[0];
          setOrgId(found.id);
          setOrgData({
            name: found.name,
            isPublished: !!found.website?.isPublished,
          });
          localStorage.setItem('currentOrgId', found.id);
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

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <>
      <style>{`
        .sitex-shell-container {
          display: grid;
          grid-template-rows: 56px 1fr 28px;
          height: 100dvh;
          max-height: 100dvh;
          width: 100vw;
          background: #090A0D;
          overflow: hidden;
          color: #F4F5F8;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .sitex-shell-container {
            grid-template-rows: 52px 1fr 0px;
          }
          .sitex-bottom-statusbar {
            display: none !important;
          }
        }
      `}</style>

      <div className="sitex-shell-container">
        {/* 1. TopBar */}
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
          orgName={orgData?.name}
          isPublished={orgData?.isPublished}
          userName={session?.user?.name || 'Admin'}
        />

        {/* 2. Main Workspace */}
        <main
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            minHeight: 0,
            background: '#090A0D',
            display: 'flex',
          }}
        >
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
              onApplyTheme={() => {}}
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
        </main>

        {/* 3. Bottom Status Bar */}
        <footer
          role="status"
          aria-label="Redaktor status çubuğu"
          className="sitex-bottom-statusbar"
          style={{
            height: 28,
            minHeight: 28,
            maxHeight: 28,
            background: '#0B0C10',
            borderTop: '1px solid #1C202A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            fontSize: 11,
            color: '#8A8F9E',
            userSelect: 'none',
            boxSizing: 'border-box',
            zIndex: 40,
          }}
        >
          {/* Sol */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#00D37D' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D37D' }} />
              0 Xəta
            </span>
            <span style={{ color: '#2B313E' }}>•</span>
            <span style={{ color: '#7E8494' }}>STL v2.0 Uyğun</span>
          </div>

          {/* Orta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#E2E5EE', fontWeight: 600 }}>
              {selectedNode ? `Seçilib: ${selectedNode.type}` : 'Bölmə seçilməyib'}
            </span>
            <span style={{ color: '#2B313E' }}>•</span>
            <span style={{ color: '#7E8494' }}>Cəmi {nodes.length} bölmə</span>
          </div>

          {/* Sağ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, color: '#00D37D' }}>
              {device === 'desktop' ? 'Masaüstü (100%)' : device === 'tablet' ? 'Planşet (768px)' : 'Mobil (390px)'}
            </span>
            <span style={{ color: '#2B313E' }}>•</span>
            <span style={{ color: '#7E8494' }}>SiteX Studio</span>
          </div>
        </footer>

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
    </>
  );
}
