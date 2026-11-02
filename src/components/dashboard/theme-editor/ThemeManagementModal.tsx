'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  Copy,
  Check,
  FileCode,
  Sparkles,
  Layers,
  AlertTriangle,
  FolderPlus,
} from 'lucide-react';
import { ThemeConfig, defaultThemes } from '@/lib/themes';
import { parseSTL, compileSTL, convertSTLToThemeConfig, themeConfigToSTL } from '@/modules/stl';

export type ModalType = 'create' | 'duplicate' | 'rename' | 'import' | 'export' | null;

interface ThemeManagementModalProps {
  type: ModalType;
  currentTheme: ThemeConfig;
  onClose: () => void;
  onCreateTheme: (name: string, description: string, baseId?: string) => void;
  onDuplicateTheme: (name: string) => void;
  onRenameTheme: (newName: string) => void;
  onImportTheme: (importedConfig: ThemeConfig, stlCode?: string) => void;
}

export default function ThemeManagementModal({
  type,
  currentTheme,
  onClose,
  onCreateTheme,
  onDuplicateTheme,
  onRenameTheme,
  onImportTheme,
}: ThemeManagementModalProps) {
  if (!type) return null;

  // Create & Duplicate state
  const [themeName, setThemeName] = useState(
    type === 'duplicate' ? `${currentTheme.name} (Kopya)` : type === 'rename' ? currentTheme.name : ''
  );
  const [themeDesc, setThemeDesc] = useState(currentTheme.description || '');
  const [selectedBaseId, setSelectedBaseId] = useState<string>('modern');

  // Import state
  const [importFileContent, setImportFileContent] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export state
  const [copiedStl, setCopiedStl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportFileContent(content);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!importFileContent.trim()) {
      setImportError('Fayl boşdur');
      return;
    }

    try {
      if (importFileName.endsWith('.json') || importFileContent.trim().startsWith('{')) {
        const parsedJson = JSON.parse(importFileContent);
        const config: ThemeConfig = {
          ...currentTheme,
          ...parsedJson,
        };
        onImportTheme(config, themeConfigToSTL(config));
        onClose();
        return;
      }

      // Treat as STL
      const { ast, errors } = parseSTL(importFileContent);
      const fatalErrors = errors.filter((e) => e.severity === 'error');
      if (fatalErrors.length > 0) {
        setImportError(`STL Xətası (sətir ${fatalErrors[0].line}): ${fatalErrors[0].message}`);
        return;
      }
      if (!ast) {
        setImportError('STL faylından tema oxuna bilmədi');
        return;
      }

      const importedConfig = convertSTLToThemeConfig(ast, currentTheme);
      onImportTheme(importedConfig, importFileContent);
      onClose();
    } catch (err: any) {
      setImportError(err?.message || 'Fayl emal edilərkən xəta baş verdi');
    }
  };

  const handleExportSTL = () => {
    const stlCode = themeConfigToSTL(currentTheme);
    const blob = new Blob([stlCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTheme.id || 'theme'}.stl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(currentTheme, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTheme.id || 'theme'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySTL = () => {
    const stlCode = themeConfigToSTL(currentTheme);
    navigator.clipboard.writeText(stlCode);
    setCopiedStl(true);
    setTimeout(() => setCopiedStl(false), 2000);
  };

  const copyJSON = () => {
    const jsonStr = JSON.stringify(currentTheme, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#161822',
          borderRadius: 14,
          border: '1px solid #323548',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #282A3A',
            background: '#1B1E2B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#00D37D" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>
              {type === 'create' && 'Yeni Tema Yarat'}
              {type === 'duplicate' && 'Temanın Nüsxəsini Yarat'}
              {type === 'rename' && 'Temanı Yenidən Adlandır'}
              {type === 'import' && 'Tema İdxal Et (.stl və ya .json)'}
              {type === 'export' && 'Temanı İxrac Et'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 20 }}>
          {/* CREATE THEME */}
          {type === 'create' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
                  Tema Adı
                </label>
                <input
                  type="text"
                  placeholder="Məs: Qızıl Payız Teması"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
                  Təsvir
                </label>
                <input
                  type="text"
                  placeholder="Temanın üslubu və vizual xarakteri haqqında qısa məlumat..."
                  value={themeDesc}
                  onChange={(e) => setThemeDesc(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
                  Baza Başlanğıc Teması
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {Object.values(defaultThemes).slice(0, 4).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedBaseId(t.id)}
                      style={{
                        padding: '10px 12px',
                        background: selectedBaseId === t.id ? 'rgba(0,211,125,0.15)' : '#131520',
                        border: selectedBaseId === t.id ? '1.5px solid #00D37D' : '1px solid #33374D',
                        borderRadius: 8,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                        {t.name}
                      </span>
                      <span style={{ fontSize: 11, color: '#8888A0', marginTop: 2, display: 'block' }}>
                        {t.headingFont} • {t.primaryColor}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #33374D',
                    background: 'transparent',
                    color: '#8888A0',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (themeName.trim()) {
                      onCreateTheme(themeName.trim(), themeDesc.trim(), selectedBaseId);
                      onClose();
                    }
                  }}
                  disabled={!themeName.trim()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#00D37D',
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: themeName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Temanı Yarat
                </button>
              </div>
            </div>
          )}

          {/* DUPLICATE THEME */}
          {type === 'duplicate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
                  Yeni Kopya Adı
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #33374D',
                    background: 'transparent',
                    color: '#8888A0',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (themeName.trim()) {
                      onDuplicateTheme(themeName.trim());
                      onClose();
                    }
                  }}
                  disabled={!themeName.trim()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#00D37D',
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: themeName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Kopyala & Tətbiq Et
                </button>
              </div>
            </div>
          )}

          {/* RENAME THEME */}
          {type === 'rename' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
                  Yeni Tema Adı
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #33374D',
                    background: 'transparent',
                    color: '#8888A0',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (themeName.trim()) {
                      onRenameTheme(themeName.trim());
                      onClose();
                    }
                  }}
                  disabled={!themeName.trim()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#00D37D',
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: themeName.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Adı Dəyiş
                </button>
              </div>
            </div>
          )}

          {/* IMPORT THEME */}
          {type === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".stl,.json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  height: 120,
                  border: '1.5px dashed #3A3E54',
                  borderRadius: 10,
                  background: '#131520',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: 16,
                  textAlign: 'center',
                }}
              >
                <Upload size={24} color="#00D37D" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                  {importFileName ? importFileName : '.stl və ya .json faylı seçin'}
                </span>
                <span style={{ fontSize: 11, color: '#8888A0' }}>
                  Kompüterinizdən tema faylını seçin və ya bura atın
                </span>
              </div>

              {/* Textarea for direct code paste */}
              <div>
                <label style={{ fontSize: 12, color: '#C8CAD8', display: 'block', marginBottom: 6 }}>
                  və ya STL / JSON kodunu birbaşa yapışdırın:
                </label>
                <textarea
                  value={importFileContent}
                  onChange={(e) => {
                    setImportFileContent(e.target.value);
                    setImportError(null);
                  }}
                  placeholder={'theme "MyTheme" {\n  colors {\n    primary: "#00D37D"\n  }\n}'}
                  rows={6}
                  style={{
                    width: '100%',
                    background: '#131520',
                    border: '1px solid #33374D',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {importError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid #EF4444',
                    borderRadius: 6,
                    color: '#FCA5A5',
                    fontSize: 12,
                  }}
                >
                  <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                  <span>{importError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #33374D',
                    background: 'transparent',
                    color: '#8888A0',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={!importFileContent.trim()}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#00D37D',
                    color: '#000000',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: importFileContent.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  İdxal Et & Tətbiq Et
                </button>
              </div>
            </div>
          )}

          {/* EXPORT THEME */}
          {type === 'export' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 14,
                  background: '#1C1F2E',
                  borderRadius: 10,
                  border: '1px solid #2B2F44',
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                    SiteX Theme Language (.stl)
                  </span>
                  <span style={{ fontSize: 11, color: '#8888A0' }}>
                    Platformanın rəsmi STL standartında kod faylı
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={copySTL}
                    style={{
                      padding: '6px 10px',
                      background: '#131520',
                      border: '1px solid #33374D',
                      borderRadius: 6,
                      color: '#8888A0',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copiedStl ? <Check size={12} color="#00D37D" /> : <Copy size={12} />}
                    {copiedStl ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportSTL}
                    style={{
                      padding: '6px 12px',
                      background: '#00D37D',
                      border: 'none',
                      borderRadius: 6,
                      color: '#000000',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Download size={12} />
                    Faylı Yüklə
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 14,
                  background: '#1C1F2E',
                  borderRadius: 10,
                  border: '1px solid #2B2F44',
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF', display: 'block' }}>
                    JSON Konfiqurasiya Faylı (.json)
                  </span>
                  <span style={{ fontSize: 11, color: '#8888A0' }}>
                    Tam tema parametrləri JSON formatında
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={copyJSON}
                    style={{
                      padding: '6px 10px',
                      background: '#131520',
                      border: '1px solid #33374D',
                      borderRadius: 6,
                      color: '#8888A0',
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copiedJson ? <Check size={12} color="#00D37D" /> : <Copy size={12} />}
                    {copiedJson ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    style={{
                      padding: '6px 12px',
                      background: '#7C5CFC',
                      border: 'none',
                      borderRadius: 6,
                      color: '#FFFFFF',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Download size={12} />
                    Faylı Yüklə
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
