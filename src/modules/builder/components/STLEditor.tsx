'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Search,
  Copy,
  Download,
  Upload,
  Code2,
  FolderOpen,
  ChevronRight,
  Maximize2,
  Minimize2,
  Layers,
} from 'lucide-react';
import { parseSTL, compileSTL, stringifySTL } from '../../stl';
import { STLError } from '../../stl/types';
import { getSTLCompletions } from '../../stl/intellisense';

interface STLEditorProps {
  code: string;
  onChangeCode: (code: string) => void;
  onApplyTheme: (compiledCss: string) => void;
  onFormatCode?: () => void;
}

export function STLEditor({
  code,
  onChangeCode,
  onApplyTheme,
  onFormatCode,
}: STLEditorProps) {
  const [activeFile, setActiveFile] = useState<string>('main.stl');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [errors, setErrors] = useState<STLError[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<any[]>([]);
  const [selectedAutoIdx, setSelectedAutoIdx] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [autoSync, setAutoSync] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Validate on code change
  useEffect(() => {
    const { ast, errors: parseErrors } = parseSTL(code);
    setErrors(parseErrors);

    if (parseErrors.filter((e: STLError) => e.severity === 'error').length === 0 && ast && autoSync) {
      const compiled = compileSTL(ast);
      onApplyTheme(compiled.compiledCss);
    }
  }, [code, autoSync, onApplyTheme]);

  // Code formatting (Beautify)
  const handleFormat = () => {
    const { ast, errors: errs } = parseSTL(code);
    if (ast && errs.filter((e: STLError) => e.severity === 'error').length === 0) {
      const formatted = stringifySTL(ast);
      onChangeCode(formatted);
    } else {
      alert('Sintaksis xətası var. Formatlamadan öncə xətaları düzəldin.');
    }
  };

  // Search and replace
  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const nextCode = code.replaceAll(searchQuery, replaceQuery);
    onChangeCode(nextCode);
  };

  // Autocomplete trigger
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedAutoIdx((prev) => (prev + 1) % autocompleteItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedAutoIdx((prev) => (prev - 1 + autocompleteItems.length) % autocompleteItems.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = autocompleteItems[selectedAutoIdx];
        if (selected) {
          insertSnippet(selected.insertText);
          setShowAutocomplete(false);
        }
        return;
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    }

    if (e.ctrlKey && e.key === ' ') {
      e.preventDefault();
      const suggestions = getSTLCompletions();
      setAutocompleteItems(suggestions);
      setSelectedAutoIdx(0);
      setShowAutocomplete(true);
      return;
    }

    // Auto indentation on Enter
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const beforeCursor = code.substring(0, start);
      const lastLine = beforeCursor.split('\n').pop() || '';
      const indentMatch = lastLine.match(/^(\s+)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      const extraIndent = lastLine.trim().endsWith('{') ? '  ' : '';

      e.preventDefault();
      const insert = '\n' + currentIndent + extraIndent;
      const nextCode = code.substring(0, start) + insert + code.substring(textarea.selectionEnd);
      onChangeCode(nextCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insert.length;
      }, 0);
    }
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const cleanSnippet = snippet.replace(/\$\{\d+:([^}]+)\}/g, '$1').replace(/\$\d+/g, '');
    const nextCode = code.substring(0, start) + cleanSnippet + code.substring(end);
    onChangeCode(nextCode);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + cleanSnippet.length;
      textarea.focus();
    }, 0);
  };

  const handleCursorMove = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const lines = code.substring(0, start).split('\n');
    setCursorPosition({
      line: lines.length,
      col: (lines[lines.length - 1] || '').length + 1,
    });
  };

  // Line count for gutter
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  return (
    <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 56px)', background: '#121418', overflow: 'hidden' }}>
      {/* Left STL File Explorer */}
      <div
        style={{
          width: 240,
          background: '#0E1013',
          borderRight: '1px solid #22262E',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #22262E', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={16} color="#00D37D" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#F0F0F3', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Tema Faylları
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: 8, gap: 4 }}>
          {[
            { id: 'main.stl', label: 'main.stl (Ana Tema)', isMain: true },
            { id: 'colors.stl', label: 'colors.stl (Rənglər)' },
            { id: 'typography.stl', label: 'typography.stl (Şriftlər)' },
            { id: 'layout.stl', label: 'layout.stl (Tərtibat)' },
            { id: 'components.stl', label: 'components.stl (Stillər)' },
          ].map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setActiveFile(file.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                background: activeFile === file.id ? '#1A1D24' : 'transparent',
                color: activeFile === file.id ? '#00D37D' : '#8888A0',
                fontSize: 12,
                fontWeight: activeFile === file.id ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <FileCode size={14} color={activeFile === file.id ? '#00D37D' : '#6A6A80'} />
              <span>{file.label}</span>
            </button>
          ))}
        </div>

        {/* Snippet Toolbox */}
        <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid #22262E', background: '#0B0C0E' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#8888A0', display: 'block', marginBottom: 8 }}>
            Tez Snippetlər
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: '+ Rəng Bloku', snippet: '\n  colors {\n    primary: "#00D37D"\n    secondary: "#1A1A2E"\n  }' },
              { label: '+ Düymə Stili', snippet: '\n    button {\n      background: colors.primary\n      color: "#FFFFFF"\n      radius: "8px"\n    }' },
              { label: '+ Kart Stili', snippet: '\n    card {\n      background: colors.surface\n      radius: "12px"\n    }' },
            ].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertSnippet(s.snippet)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 4,
                  border: '1px solid #22262E',
                  background: '#14161B',
                  color: '#C0C0D0',
                  fontSize: 11,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Code Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Editor Toolbar */}
        <div
          style={{
            height: 44,
            background: '#16181E',
            borderBottom: '1px solid #22262E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00D37D', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Code2 size={16} />
              {activeFile}
            </span>
            <span style={{ fontSize: 11, color: '#8888A0' }}>SiteX Theme Language (STL)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #282C35',
                background: showSearch ? 'rgba(0,211,125,0.1)' : 'transparent',
                color: showSearch ? '#00D37D' : '#8888A0',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Search size={13} />
              Axtar & Dəyişdir
            </button>

            <button
              type="button"
              onClick={handleFormat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #282C35',
                background: 'transparent',
                color: '#C0C0D0',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={13} color="#00D37D" />
              Formatla (Beautify)
            </button>

            <button
              type="button"
              onClick={() => {
                const { ast } = parseSTL(code);
                if (ast) {
                  const compiled = compileSTL(ast);
                  onApplyTheme(compiled.compiledCss);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: '#00D37D',
                color: '#000',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Play size={13} />
              Kodu İcra Et & Tətbiq Et
            </button>
          </div>
        </div>

        {/* Search & Replace Floating Bar */}
        {showSearch && (
          <div
            style={{
              padding: '10px 16px',
              background: '#1A1D24',
              borderBottom: '1px solid #282C35',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="Axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #333',
                background: '#121418',
                color: '#FFF',
                fontSize: 12,
                width: 180,
              }}
            />
            <input
              type="text"
              placeholder="Əvəz et..."
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #333',
                background: '#121418',
                color: '#FFF',
                fontSize: 12,
                width: 180,
              }}
            />
            <button
              type="button"
              onClick={handleReplaceAll}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: '#282C35',
                color: '#FFF',
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hamısını Dəyişdir
            </button>
          </div>
        )}

        {/* Editor Main Canvas with Gutter */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
          {/* Line Numbers Gutter */}
          <div
            style={{
              width: 48,
              background: '#0E1013',
              borderRight: '1px solid #22262E',
              padding: '16px 0',
              userSelect: 'none',
              textAlign: 'right',
              paddingRight: 12,
              fontFamily: '"Fira Code", monospace, Consolas',
              fontSize: 13,
              lineHeight: '21px',
              color: '#555866',
            }}
          >
            {Array.from({ length: lineCount }, (_, i) => i + 1).map((num) => {
              const hasErr = errors.some((e) => e.line === num);
              return (
                <div key={num} style={{ color: hasErr ? '#EF4444' : undefined, fontWeight: hasErr ? 700 : undefined }}>
                  {num}
                </div>
              );
            })}
          </div>

          {/* Code Textarea with Highlighting */}
          <div style={{ flex: 1, position: 'relative', height: '100%', background: '#121418' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onChangeCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              spellCheck={false}
              style={{
                width: '100%',
                height: '100%',
                padding: '16px',
                background: 'transparent',
                color: '#F0F0F3',
                fontFamily: '"Fira Code", "Courier New", monospace',
                fontSize: 13,
                lineHeight: '21px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                whiteSpace: 'pre',
                tabSize: 2,
              }}
            />

            {/* Autocomplete Popup */}
            {showAutocomplete && (
              <div
                style={{
                  position: 'absolute',
                  top: 60,
                  left: 60,
                  width: 280,
                  maxHeight: 220,
                  background: '#1A1D24',
                  border: '1px solid #00D37D',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  overflowY: 'auto',
                  zIndex: 100,
                }}
              >
                <div style={{ padding: '6px 10px', fontSize: 10, color: '#8888A0', borderBottom: '1px solid #282C35' }}>
                  STL Təklifləri (Enter və ya Tab ilə seçin)
                </div>
                {autocompleteItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      insertSnippet(item.insertText);
                      setShowAutocomplete(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: selectedAutoIdx === idx ? 'rgba(0,211,125,0.15)' : 'transparent',
                      color: selectedAutoIdx === idx ? '#00D37D' : '#FFF',
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: 10, color: '#8888A0' }}>{item.kind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status & Diagnostics Console */}
        <div
          style={{
            height: errors.length > 0 ? 90 : 32,
            background: '#0B0C0E',
            borderTop: '1px solid #22262E',
            display: 'flex',
            flexDirection: 'column',
            transition: 'height 0.2s ease',
          }}
        >
          {/* Status Bar */}
          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              fontSize: 11,
              color: '#8888A0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {errors.length === 0 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00D37D', fontWeight: 600 }}>
                  <CheckCircle2 size={13} />
                  Sintaksis xətası yoxdur
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EF4444', fontWeight: 600 }}>
                  <XCircle size={13} />
                  {errors.length} xəta aşkarlandı
                </span>
              )}
              <span>•</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  style={{ accentColor: '#00D37D' }}
                />
                Canlı Avto-Sinxronizasiya
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>Sətir: {cursorPosition.line}, Sütun: {cursorPosition.col}</span>
              <span>UTF-8</span>
              <span>STL v1.0</span>
            </div>
          </div>

          {/* Diagnostics Error Panel */}
          {errors.length > 0 && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px', background: 'rgba(239,68,68,0.06)' }}>
              {errors.map((err, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#F87171', padding: '2px 0' }}>
                  <AlertTriangle size={12} />
                  <span style={{ fontWeight: 700 }}>Sətir {err.line}:{err.column}</span>
                  <span>{err.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
