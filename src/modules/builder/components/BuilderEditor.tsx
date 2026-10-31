'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '../store/builderStore';
import { TopBar } from './TopBar';
import { ComponentPalette } from './ComponentPalette';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { exportTemplateAsJSON, importTemplateFromJSON, serializeTemplateToTheme } from '../serializer';
import { useRouter } from 'next/navigation';

export function BuilderEditor() {
  const router = useRouter();
  const {
    doc,
    setDoc,
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    device,
    setDevice,
    addNode,
    updateNodeProps,
    moveNode,
    duplicateNode,
    deleteNode,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useBuilderStore();

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const handleExport = () => {
    const json = exportTemplateAsJSON(doc);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.slug || 'theme'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const imported = importTemplateFromJSON(text);
          setDoc(imported);
        } catch (err: any) {
          alert('Fayl oxunarkən xəta: ' + err.message);
        }
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const themePayload = serializeTemplateToTheme(doc);
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themePayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yadda saxlanılmadı');

      setSaveMessage('Tema uğurla yadda saxlanıldı və Theme Registry-yə əlavə olundu!');
      setTimeout(() => setSaveMessage(''), 4000);
    } catch (err: any) {
      alert('Xəta: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: '#121416', overflow: 'hidden' }}>
      <TopBar
        templateName={doc.name}
        onUpdateName={(name) => setDoc((d) => ({ ...d, name, slug: name.toLowerCase().replace(/\s+/g, '-') }))}
        device={device}
        onSetDevice={setDevice}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onExport={handleExport}
        onImport={handleImport}
        onSave={handleSave}
        saving={saving}
      />

      {saveMessage && (
        <div style={{ background: '#00D37D', color: '#000', padding: '8px 20px', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
          {saveMessage}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sol Panel: Palette / Katmanlar */}
        <ComponentPalette
          onAddComponent={(type) => addNode(type)}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onMoveNode={moveNode}
          onDuplicateNode={duplicateNode}
          onDeleteNode={deleteNode}
        />

        {/* Orta Panel: Canvas */}
        <Canvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          device={device}
          onDropComponent={(type) => addNode(type)}
        />

        {/* Sağ Panel: Özəlliklər */}
        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateProps={updateNodeProps}
          onDeleteNode={deleteNode}
          onDuplicateNode={duplicateNode}
          onMoveNode={moveNode}
        />
      </div>
    </div>
  );
}
