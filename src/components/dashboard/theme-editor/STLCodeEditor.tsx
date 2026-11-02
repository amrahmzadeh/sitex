'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Code,
  Check,
  Copy,
  Download,
  AlertTriangle,
  Info,
  Sparkles,
  Search,
  Replace,
  Play,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import {
  parseSTL,
  compileSTL,
  stringifySTL,
  getSTLCompletions,
  STLCompletionItem,
  STLError,
  STLThemeNode,
} from '@/modules/stl';

interface STLCodeEditorProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
  onCompileSuccess: (ast: STLThemeNode) => void;
  readOnly?: boolean;
}

type TabType = 'main.stl' | 'colors.stl' | 'components.stl' | 'compiled.css';

export default function STLCodeEditor({
  initialCode,
  onCodeChange,
  onCompileSuccess,
  readOnly = false,
}: STLCodeEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('main.stl');
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<STLError[]>([]);
  const [compiledCss, setCompiledCss] = useState<string>('');
  const [showErrorPanel, setShowErrorPanel] = useState(true);

  // Search & Replace state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  // Autocomplete state
  const [completions, setCompletions] = useState<STLCompletionItem[]>([]);
  const [selectedCompletion, setSelectedCompletion] = useState(0);
  const [showCompletions, setShowCompletions] = useState(false);
  const [cursorWord, setCursorWord] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync external code change if updated from visual builder
  useEffect(() => {
    if (initialCode !== code) {
      setCode(initialCode);
    }
  }, [initialCode]);

  // Parse and validate code
  useEffect(() => {
    try {
      const { ast, errors: parseErrors } = parseSTL(code);
      setErrors(parseErrors);

      if (ast) {
        const compiled = compileSTL(ast);
        setCompiledCss(compiled.compiledCss || '');
        if (parseErrors.filter((e) => e.severity === 'error').length === 0) {
          onCompileSuccess(ast);
        }
      }
    } catch (err: any) {
      setErrors([
        {
          message: err?.message || 'Sintaksis xətası',
          line: 1,
          column: 1,
          severity: 'error',
        },
      ]);
    }
  }, [code]);

  const lines = useMemo(() => code.split('\n'), [code]);

  const handleTextareaScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCodeChange = (newVal: string) => {
    setCode(newVal);
    onCodeChange(newVal);
  };

  // Autocomplete trigger
  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
      return;
    }
    const ta = textareaRef.current;
    if (!ta) return;

    const pos = ta.selectionStart;
    const textBefore = code.substring(0, pos);
    const match = textBefore.match(/([a-zA-Z0-9_.-]+)$/);

    if (match && match[1].length >= 1) {
      const word = match[1];
      setCursorWord(word);
      const items = getSTLCompletions(word, textBefore.slice(-100));
      if (items.length > 0) {
        setCompletions(items);
        setSelectedCompletion(0);
        setShowCompletions(true);
        return;
      }
    }
    setShowCompletions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Autocomplete navigation
    if (showCompletions && completions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCompletion((prev) => (prev + 1) % completions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCompletion((prev) => (prev - 1 + completions.length) % completions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyCompletion(completions[selectedCompletion]);
        return;
      }
      if (e.key === 'Escape') {
        setShowCompletions(false);
        return;
      }
    }

    // Tab key indent
    if (e.key === 'Tab' && !showCompletions) {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = code.substring(0, start) + '  ' + code.substring(end);
      handleCodeChange(newVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }
  };

  const applyCompletion = (item: STLCompletionItem) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = code.substring(0, pos);
    const textAfter = code.substring(pos);

    // Replace the current partial word
    const match = textBefore.match(/([a-zA-Z0-9_.-]+)$/);
    const prefixLen = match ? match[1].length : 0;
    const insertClean = item.insertText.replace(/\$\{\d+:?([^}]*)\}/g, '$1').replace(/\$0/g, '');

    const newCode = textBefore.substring(0, pos - prefixLen) + insertClean + textAfter;
    handleCodeChange(newCode);
    setShowCompletions(false);

    setTimeout(() => {
      ta.focus();
      const newPos = pos - prefixLen + insertClean.length;
      ta.selectionStart = ta.selectionEnd = newPos;
    }, 0);
  };

  // Format Code
  const handleFormat = () => {
    try {
      const { ast } = parseSTL(code);
      if (ast) {
        const formatted = stringifySTL(ast);
        handleCodeChange(formatted);
      }
    } catch {
      // ignore
    }
  };

  // Copy code
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download STL file
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme.stl';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Search & Replace actions
  const handleSearchReplace = (replaceAll = false) => {
    if (!searchQuery) return;
    if (replaceAll) {
      const replaced = code.split(searchQuery).join(replaceQuery);
      handleCodeChange(replaced);
    } else {
      const idx = code.indexOf(searchQuery);
      if (idx !== -1) {
        const replaced = code.substring(0, idx) + replaceQuery + code.substring(idx + searchQuery.length);
        handleCodeChange(replaced);
      }
    }
  };

  // Jump to error line
  const jumpToLine = (line: number) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const lineIndex = Math.max(0, line - 1);
    let charPos = 0;
    for (let i = 0; i < lineIndex && i < lines.length; i++) {
      charPos += lines[i].length + 1;
    }
    ta.focus();
    ta.setSelectionRange(charPos, charPos + (lines[lineIndex]?.length || 0));
  };

  // Sub-tabs code view
  const displayCode = useMemo(() => {
    if (activeTab === 'main.stl') return code;
    if (activeTab === 'compiled.css') return compiledCss || '/* CSS generasiyası üçün STL sintaksisini yoxlayın */';

    // Extract blocks for colors.stl and components.stl
    try {
      const { ast } = parseSTL(code);
      if (!ast) return '// Sintaksis xətası var, blokları oxumaq mümkün deyil';
      if (activeTab === 'colors.stl') {
        const lines: string[] = ['// colors.stl - Palitra və Rəng Sabitləri', 'colors {'];
        for (const [k, v] of Object.entries(ast.colors || {})) {
          lines.push(`  ${k}: "${v}"`);
        }
        lines.push('}');
        return lines.join('\n');
      }
      if (activeTab === 'components.stl') {
        const lines: string[] = ['// components.stl - Komponent Blokları', 'components {'];
        for (const [comp, props] of Object.entries(ast.components || {})) {
          lines.push(`  ${comp} {`);
          for (const [k, v] of Object.entries(props)) {
            lines.push(`    ${k}: "${v}"`);
          }
          lines.push('  }');
        }
        lines.push('}');
        return lines.join('\n');
      }
    } catch {
      return '// Xəta baş verdi';
    }
    return code;
  }, [activeTab, code, compiledCss]);

  const errorLines = useMemo(() => {
    const map = new Map<number, STLError>();
    errors.forEach((err) => {
      map.set(err.line, err);
    });
    return map;
  }, [errors]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#12131A',
        borderRadius: 12,
        border: '1px solid #282A3A',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top IDE Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          background: '#181A24',
          borderBottom: '1px solid #282A3A',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(['main.stl', 'colors.stl', 'components.stl', 'compiled.css'] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? '#24283B' : 'transparent',
                  color: isActive ? '#00D37D' : '#8888A0',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <FileCode size={13} color={isActive ? '#00D37D' : '#6A6A80'} />
                {tab}
                {tab === 'main.stl' && errors.length > 0 && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#EF4444',
                      display: 'inline-block',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            title="Axtar və Əvəz Et (Ctrl+F)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #323548',
              background: searchOpen ? 'rgba(0,211,125,0.1)' : '#1F2230',
              color: searchOpen ? '#00D37D' : '#B0B0C4',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <Search size={12} />
            Axtar
          </button>

          {activeTab === 'main.stl' && !readOnly && (
            <button
              type="button"
              onClick={handleFormat}
              title="Kodu səliqəyə sal"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #323548',
                background: '#1F2230',
                color: '#B0B0C4',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={12} color="#7C5CFC" />
              Formatla
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Kodu kopyala"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #323548',
              background: '#1F2230',
              color: '#B0B0C4',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} color="#00D37D" /> : <Copy size={12} />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="STL faylını yüklə"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid #323548',
              background: '#1F2230',
              color: '#B0B0C4',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <Download size={12} />
            İxrac
          </button>
        </div>
      </div>

      {/* Search & Replace Bar */}
      {searchOpen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: '#1F2230',
            borderBottom: '1px solid #282A3A',
            fontSize: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#8888A0' }}>Axtar:</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Axtarılan söz..."
              style={{
                background: '#12131A',
                border: '1px solid #323548',
                borderRadius: 4,
                padding: '4px 8px',
                color: '#FFFFFF',
                fontSize: 11,
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#8888A0' }}>Əvəz et:</span>
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Yeni dəyər..."
              style={{
                background: '#12131A',
                border: '1px solid #323548',
                borderRadius: 4,
                padding: '4px 8px',
                color: '#FFFFFF',
                fontSize: 11,
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearchReplace(false)}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: '#7C5CFC',
              color: '#fff',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Əvəz et
          </button>
          <button
            type="button"
            onClick={() => handleSearchReplace(true)}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: 'none',
              background: '#00D37D',
              color: '#000',
              fontWeight: 600,
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Hamısını əvəz et
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            style={{
              padding: 4,
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Code Editor Body */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          minHeight: 440,
        }}
      >
        {/* Line Numbers with Error Markers */}
        <div
          ref={lineNumbersRef}
          style={{
            width: 52,
            background: '#151722',
            borderRight: '1px solid #282A3A',
            padding: '12px 0',
            textAlign: 'right',
            userSelect: 'none',
            overflowY: 'hidden',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: 13,
            lineHeight: '21px',
            color: '#4B4E63',
          }}
        >
          {lines.map((_, i) => {
            const lineNum = i + 1;
            const err = errorLines.get(lineNum);
            return (
              <div
                key={lineNum}
                onClick={() => err && jumpToLine(lineNum)}
                style={{
                  paddingRight: 10,
                  position: 'relative',
                  cursor: err ? 'pointer' : 'default',
                  color: err ? '#EF4444' : '#4B4E63',
                  fontWeight: err ? 700 : 400,
                  background: err ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                }}
                title={err ? `${err.severity.toUpperCase()}: ${err.message}` : undefined}
              >
                {err && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 6,
                      top: 4,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#EF4444',
                    }}
                  />
                )}
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea Editor */}
        <div style={{ position: 'relative', flex: 1, height: '100%' }}>
          <textarea
            ref={textareaRef}
            value={displayCode}
            readOnly={activeTab !== 'main.stl' || readOnly}
            onChange={(e) => handleCodeChange(e.target.value)}
            onScroll={handleTextareaScroll}
            onKeyUp={handleKeyUp}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              color: '#F0F2F8',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: '12px 16px',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: 13,
              lineHeight: '21px',
              whiteSpace: 'pre',
              tabSize: 2,
            }}
          />

          {/* Autocomplete Popup */}
          {showCompletions && completions.length > 0 && activeTab === 'main.stl' && (
            <div
              style={{
                position: 'absolute',
                top: 50,
                left: 120,
                width: 280,
                background: '#1F2230',
                border: '1px solid #3A3D54',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '6px 10px',
                  background: '#161822',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#8888A0',
                  borderBottom: '1px solid #282A3A',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>STL IntelliSense</span>
                <span>↑↓ Seç, Enter Təsdiq</span>
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {completions.map((item, idx) => {
                  const isSel = idx === selectedCompletion;
                  return (
                    <div
                      key={item.label}
                      onClick={() => applyCompletion(item)}
                      style={{
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isSel ? 'rgba(0,211,125,0.15)' : 'transparent',
                        color: isSel ? '#00D37D' : '#E0E2EC',
                        fontSize: 12,
                        fontFamily: 'monospace',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontSize: 9,
                            padding: '2px 4px',
                            borderRadius: 3,
                            background:
                              item.kind === 'keyword'
                                ? '#7C5CFC'
                                : item.kind === 'property'
                                ? '#38BDF8'
                                : item.kind === 'variable'
                                ? '#F59E0B'
                                : '#10B981',
                            color: '#FFFFFF',
                            fontWeight: 700,
                          }}
                        >
                          {item.kind.slice(0, 3).toUpperCase()}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 10, color: '#8888A0' }}>{item.detail}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Diagnostics / Error Panel */}
      <div
        style={{
          background: '#161822',
          borderTop: '1px solid #282A3A',
        }}
      >
        <div
          onClick={() => setShowErrorPanel(!showErrorPanel)}
          style={{
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: 12,
            color: errors.length > 0 ? '#EF4444' : '#00D37D',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Terminal size={14} />
            <span>
              Diaqnostika:{' '}
              {errors.length === 0
                ? 'Heç bir sintaksis xətası yoxdur (0 xəta)'
                : `${errors.length} xəta və ya xəbərdarlıq tapıldı`}
            </span>
          </div>
          <div>{showErrorPanel ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</div>
        </div>

        {showErrorPanel && errors.length > 0 && (
          <div
            style={{
              maxHeight: 130,
              overflowY: 'auto',
              padding: '6px 14px 10px',
              borderTop: '1px solid #202330',
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {errors.map((err, i) => (
              <div
                key={i}
                onClick={() => jumpToLine(err.line)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '4px 6px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: err.severity === 'error' ? '#FCA5A5' : '#FDE68A',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#222534')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                {err.severity === 'error' ? (
                  <AlertTriangle size={13} color="#EF4444" style={{ marginTop: 2, flexShrink: 0 }} />
                ) : (
                  <Info size={13} color="#F59E0B" style={{ marginTop: 2, flexShrink: 0 }} />
                )}
                <div>
                  <span style={{ color: '#00D37D', marginRight: 6 }}>
                    [{err.line}:{err.column}]
                  </span>
                  <span>{err.message}</span>
                  {err.suggestion && (
                    <span style={{ color: '#38BDF8', marginLeft: 8 }}>💡 {err.suggestion}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
