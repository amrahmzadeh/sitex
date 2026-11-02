'use client';

import React, { useState } from 'react';
import {
  Download,
  Upload,
  Copy,
  Check,
  FileCode,
  FileJson,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { parseSTL, compileSTL } from '../../stl';
import { BuilderTemplateDocument } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stlCode: string;
  doc: BuilderTemplateDocument;
  onImportSTL: (code: string) => void;
  onImportJSON: (jsonString: string) => void;
}

export function ImportExportModal({
  isOpen,
  onClose,
  stlCode,
  doc,
  onImportSTL,
  onImportJSON,
}: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySTL = () => {
    navigator.clipboard.writeText(stlCode);
    setCopiedType('stl');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadSTL = () => {
    const blob = new Blob([stlCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.slug || 'theme'}.stl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.slug || 'theme'}.sitex-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    setImportSuccess(null);
    const trimmed = importText.trim();

    if (!trimmed) {
      setImportError('Zəhmət olmasa STL kodu və ya JSON mətni daxil edin.');
      return;
    }

    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed.id) {
          throw new Error('JSON faylında tələb olunan "id" xassəsi tapılmadı.');
        }
        onImportJSON(trimmed);
        setImportSuccess('JSON şablonu uğurla idxal edildi!');
        setTimeout(() => onClose(), 1200);
      } catch (err: any) {
        setImportError(`JSON xətası: ${err.message}`);
      }
      return;
    }

    // Try STL
    const { ast, errors } = parseSTL(trimmed);
    const fatalErrors = errors.filter((e) => e.severity === 'error');
    if (fatalErrors.length > 0) {
      setImportError(`Sintaksis xətası: ${fatalErrors[0].message} (Sətir: ${fatalErrors[0].line})`);
      return;
    }

    onImportSTL(trimmed);
    setImportSuccess('STL tema kodu uğurla təsdiqləndi və idxal edildi!');
    setTimeout(() => onClose(), 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 580,
          background: '#16181E',
          borderRadius: 16,
          border: '1px solid #282C35',
          boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #252932', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: activeTab === 'export' ? '1px solid #00D37D' : '1px solid transparent',
                background: activeTab === 'export' ? 'rgba(0,211,125,0.12)' : 'transparent',
                color: activeTab === 'export' ? '#00D37D' : '#8888A0',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={15} />
              İxrac Et (Export)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                border: activeTab === 'import' ? '1px solid #00D37D' : '1px solid transparent',
                background: activeTab === 'import' ? 'rgba(0,211,125,0.12)' : 'transparent',
                color: activeTab === 'import' ? '#00D37D' : '#8888A0',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={15} />
              İdxal Et (Import)
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#8888A0', fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: 24 }}>
          {activeTab === 'export' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, color: '#8888A0', margin: 0 }}>
                Temanızı STL mənbə kodu və ya JSON şablon paketi formatında ixrac edə bilərsiniz.
              </p>

              {/* STL Export Box */}
              <div style={{ padding: 16, background: '#121418', borderRadius: 10, border: '1px solid #252932', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileCode size={24} color="#00D37D" />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#FFF', display: 'block' }}>
                      SiteX Theme Language (.stl)
                    </span>
                    <span style={{ fontSize: 11, color: '#8888A0' }}>
                      Sıx, oxunaqlı və portativ tema kodu
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleCopySTL}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#1F222A',
                      color: copiedType === 'stl' ? '#00D37D' : '#C0C0D0',
                      border: '1px solid #282C35',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedType === 'stl' ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSTL}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      background: '#00D37D',
                      color: '#000',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Endir (.stl)
                  </button>
                </div>
              </div>

              {/* JSON Export Box */}
              <div style={{ padding: 16, background: '#121418', borderRadius: 10, border: '1px solid #252932', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileJson size={24} color="#60A5FA" />
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#FFF', display: 'block' }}>
                      JSON Şablon Paketi (.json)
                    </span>
                    <span style={{ fontSize: 11, color: '#8888A0' }}>
                      Bütün bölmələr və vizual kətan qovşaqları ilə
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#1F222A',
                      color: copiedType === 'json' ? '#00D37D' : '#C0C0D0',
                      border: '1px solid #282C35',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {copiedType === 'json' ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      background: '#3B82F6',
                      color: '#FFF',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Endir (.json)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#C0C0D0' }}>
                  STL Kodu və ya JSON Mətni
                </label>
                <label style={{ fontSize: 11, color: '#00D37D', cursor: 'pointer', fontWeight: 600 }}>
                  Fayldan Yüklə (.stl / .json)
                  <input type="file" accept=".stl,.json,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>

              <textarea
                rows={8}
                placeholder="theme 'MyTheme' { ... } və ya { 'id': '...' }"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 8,
                  background: '#0D0E11',
                  border: '1px solid #252932',
                  color: '#00D37D',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />

              {importError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid #EF4444', borderRadius: 8, color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={15} />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div style={{ padding: '10px 14px', background: 'rgba(0,211,125,0.1)', border: '1px solid #00D37D', borderRadius: 8, color: '#00D37D', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={15} />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid #282C35',
                    color: '#8888A0',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Bağla
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    background: '#00D37D',
                    color: '#000',
                    fontWeight: 700,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Yoxla və İdxal Et
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
