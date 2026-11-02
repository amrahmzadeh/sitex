'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  Sparkles,
  Search,
  Copy,
  Download,
  Code2,
  FolderOpen,
  Terminal,
  HelpCircle,
  Wand2,
  Bookmark,
  Layers,
  Palette,
  Eye,
  Type,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { parseSTL, compileSTL, stringifySTL, STLError } from '../../stl';
import { getSTLCompletions } from '../../stl/intellisense';

interface STLEditorProps {
  code: string;
  onChangeCode: (code: string) => void;
  onApplyTheme: (compiledCss: string) => void;
  onFormatCode?: () => void;
  onSave?: () => void;
  onSwitchMode?: (mode: 'visual' | 'code' | 'preview') => void;
}

export function STLEditor({
  code,
  onChangeCode,
  onApplyTheme,
  onFormatCode,
  onSave,
  onSwitchMode,
}: STLEditorProps) {
  const [activeFile, setActiveFile] = useState<string>('main.stl');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isRegex, setIsRegex] = useState(false);

  const [errors, setErrors] = useState<STLError[]>([]);
  const [hoveredSymbol, setHoveredSymbol] = useState<{
    text: string;
    resolved: string;
    x: number;
    y: number;
  } | null>(null);

  // Command Palette
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [selectedCmdIdx, setSelectedCmdIdx] = useState(0);

  // Keyboard Shortcuts Modal
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<any[]>([]);
  const [selectedAutoIdx, setSelectedAutoIdx] = useState(0);
  const [autocompletePos, setAutocompletePos] = useState({ top: 60, left: 80 });

  const [cursorPosition, setCursorPosition] = useState({ line: 1, col: 1 });
  const [autoSync, setAutoSync] = useState(true);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightPreRef = useRef<HTMLPreElement>(null);

  // Parse and validate code
  const parsed = useMemo(() => {
    return parseSTL(code);
  }, [code]);

  useEffect(() => {
    setErrors(parsed.errors);

    if (
      parsed.errors.filter((e) => e.severity === 'error').length === 0 &&
      parsed.ast &&
      autoSync
    ) {
      const compiled = compileSTL(parsed.ast);
      onApplyTheme(compiled.compiledCss);
    }
  }, [parsed, autoSync, onApplyTheme]);

  // 2s Debounced Autosave
  useEffect(() => {
    setAutosaveStatus('saving');
    const timer = setTimeout(() => {
      setAutosaveStatus('saved');
      if (onSave) {
        onSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [code, onSave]);

  // Code Formatting
  const handleFormat = useCallback(() => {
    if (parsed.ast && parsed.errors.filter((e) => e.severity === 'error').length === 0) {
      const formatted = stringifySTL(parsed.ast);
      onChangeCode(formatted);
    } else {
      alert('Sintaksis xətası var. Formatlamadan öncə qırmızı xətaları düzəldin.');
    }
  }, [parsed, onChangeCode]);

  // Quick-fix All Diagnostics
  const handleQuickFixAll = () => {
    let nextCode = code;
    let fixedCount = 0;

    for (const err of errors) {
      if (err.suggestion) {
        const match = err.suggestion.match(/'([^']+)'/);
        if (match) {
          const suggestedWord = match[1];
          // Get error target word
          const lines = nextCode.split('\n');
          if (lines[err.line - 1]) {
            const lineText = lines[err.line - 1];
            // Replace key or typo
            const words = lineText.match(/[a-zA-Z_]+/g) || [];
            const targetWord = words[0];
            if (targetWord) {
              lines[err.line - 1] = lineText.replace(targetWord, suggestedWord);
              nextCode = lines.join('\n');
              fixedCount++;
            }
          }
        }
      }
    }

    if (fixedCount > 0) {
      onChangeCode(nextCode);
    }
  };

  // Search & Replace
  const handleReplaceAll = () => {
    if (!searchQuery) return;
    try {
      let reg: RegExp;
      if (isRegex) {
        reg = new RegExp(searchQuery, isCaseSensitive ? 'g' : 'gi');
      } else {
        const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        reg = new RegExp(escaped, isCaseSensitive ? 'g' : 'gi');
      }
      const nextCode = code.replace(reg, replaceQuery);
      onChangeCode(nextCode);
    } catch (e: any) {
      alert('Axtarış regex xətası: ' + e.message);
    }
  };

  // Jump to Line
  const jumpToLine = (targetLine: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lines = code.split('\n');
    let charIndex = 0;
    for (let i = 0; i < Math.min(targetLine - 1, lines.length); i++) {
      charIndex += lines[i].length + 1;
    }

    textarea.focus();
    textarea.selectionStart = charIndex;
    textarea.selectionEnd = charIndex + (lines[targetLine - 1] || '').length;

    // Scroll textarea to line
    const lineHeight = 21;
    textarea.scrollTop = Math.max(0, (targetLine - 4) * lineHeight);
  };

  // Command Palette Items
  const commands = useMemo(() => {
    return [
      {
        id: 'format',
        label: 'Kodu Formatla (Beautify)',
        icon: Sparkles,
        shortcut: 'Ctrl+Shift+F',
        action: handleFormat,
      },
      {
        id: 'fix-all',
        label: 'Hamısını Düzəlt (Quick-Fix All)',
        icon: Wand2,
        shortcut: 'Alt+Enter',
        action: handleQuickFixAll,
      },
      {
        id: 'search',
        label: 'Axtar & Əvəz et',
        icon: Search,
        shortcut: 'Ctrl+F',
        action: () => setShowSearch(true),
      },
      {
        id: 'save',
        label: 'Yadda saxla (Snapshot)',
        icon: Bookmark,
        shortcut: 'Ctrl+S',
        action: () => onSave && onSave(),
      },
      {
        id: 'visual-mode',
        label: 'Vizual Redaktora Keç',
        icon: Palette,
        shortcut: 'Ctrl+1',
        action: () => onSwitchMode && onSwitchMode('visual'),
      },
      {
        id: 'preview-mode',
        label: 'Canlı Önizləməyə Keç',
        icon: Eye,
        shortcut: 'Ctrl+2',
        action: () => onSwitchMode && onSwitchMode('preview'),
      },
      {
        id: 'shortcuts',
        label: 'Klaviatura Qısayolları Bələdçisi',
        icon: HelpCircle,
        shortcut: '?',
        action: () => setShowShortcutsModal(true),
      },
    ];
  }, [handleFormat, handleQuickFixAll, onSave, onSwitchMode]);

  const filteredCommands = useMemo(() => {
    if (!commandQuery) return commands;
    return commands.filter((c) =>
      c.label.toLowerCase().includes(commandQuery.toLowerCase())
    );
  }, [commands, commandQuery]);

  // Insert Snippet Helper
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

  // Keyboard Event Dispatcher
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Command Palette: Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setShowCommandPalette(true);
      setCommandQuery('');
      setSelectedCmdIdx(0);
      return;
    }

    // Format: Ctrl+Shift+F
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      handleFormat();
      return;
    }

    // Save: Ctrl+S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (onSave) onSave();
      return;
    }

    // Quick-Fix: Alt+Enter
    if (e.altKey && e.key === 'Enter') {
      e.preventDefault();
      handleQuickFixAll();
      return;
    }

    // Autocomplete Navigation
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedAutoIdx((prev) => (prev + 1) % autocompleteItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedAutoIdx(
          (prev) => (prev - 1 + autocompleteItems.length) % autocompleteItems.length
        );
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

    // Trigger Autocomplete: Ctrl+Space
    if (e.ctrlKey && e.key === ' ') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea ? textarea.selectionStart : 0;
      const before = code.substring(0, start);
      const curLine = before.split('\n').pop() || '';

      const items = getSTLCompletions(curLine.trim(), curLine, parsed.ast || undefined);
      setAutocompleteItems(items);
      setSelectedAutoIdx(0);
      setShowAutocomplete(true);
      return;
    }

    // Auto-indent on Enter
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

  // Sync scroll between textarea and syntax highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightPreRef.current) {
      highlightPreRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightPreRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Line count for gutter
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        height: 'calc(100vh - 56px)',
        background: '#121418',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left STL File Explorer & Snippets */}
      <div
        style={{
          width: 230,
          background: '#0E1013',
          borderRight: '1px solid #22262E',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #22262E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOpen size={16} color="#00D37D" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#F0F0F3',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Tema Faylları
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            title="Qısayollar (?)"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8888A0',
              cursor: 'pointer',
            }}
          >
            <HelpCircle size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: 8, gap: 4 }}>
          {[
            { id: 'main.stl', label: 'main.stl (Əsas Tema)' },
            { id: 'tokens.stl', label: 'tokens.stl (Tokenlər)' },
            { id: 'modes.stl', label: 'modes.stl (Rejimlər)' },
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

        {/* Quick Snippets Toolbox */}
        <div
          style={{
            marginTop: 'auto',
            padding: 12,
            borderTop: '1px solid #22262E',
            background: '#0B0C0E',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#8888A0',
              display: 'block',
              marginBottom: 8,
            }}
          >
            STL Şablon Blokları
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              {
                label: '+ tokens { }',
                snippet:
                  '\n  tokens {\n    spacing {\n      sm: "8px"\n      md: "16px"\n      lg: "24px"\n    }\n    radius {\n      sm: "4px"\n      md: "8px"\n    }\n  }',
              },
              {
                label: '+ modes { dark { } }',
                snippet:
                  '\n  modes {\n    dark {\n      colors {\n        background: "#0D0E11"\n        surface: "#181B20"\n        text: "#F5F5F7"\n      }\n    }\n  }',
              },
              {
                label: '+ responsive { }',
                snippet:
                  '\n  responsive {\n    mobile {\n      layout {\n        containerWidth: "100%"\n        spacing: "12px"\n      }\n    }\n  }',
              },
              {
                label: '+ lighten() rəngi',
                snippet: ' lighten(colors.primary, 15%)',
              },
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
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#00D37D',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Code2 size={16} />
              {activeFile}
            </span>
            <span style={{ fontSize: 11, color: '#8888A0' }}>SiteX Theme Language (STL)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setShowCommandPalette(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #282C35',
                background: '#121418',
                color: '#8888A0',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <Terminal size={12} />
              <span>Cmd Palette (Ctrl+K)</span>
            </button>

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
              Axtar & Əvəz et
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
              Formatla (Ctrl+Shift+F)
            </button>

            <button
              type="button"
              onClick={() => {
                if (parsed.ast) {
                  const compiled = compileSTL(parsed.ast);
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
              Tətbiq Et
            </button>
          </div>
        </div>

        {/* Search & Replace Bar */}
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
              onClick={() => setIsCaseSensitive(!isCaseSensitive)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid #333',
                background: isCaseSensitive ? '#00D37D' : '#121418',
                color: isCaseSensitive ? '#000' : '#8888A0',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Aa
            </button>
            <button
              type="button"
              onClick={() => setIsRegex(!isRegex)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid #333',
                background: isRegex ? '#00D37D' : '#121418',
                color: isRegex ? '#000' : '#8888A0',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              .*
            </button>
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
              Hamısını Əvəz Et
            </button>
          </div>
        )}

        {/* Editor Main Canvas with Gutter */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
          {/* Line Numbers Gutter */}
          <div
            style={{
              width: 52,
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
              const lineErrors = errors.filter((e) => e.line === num);
              const hasErr = lineErrors.some((e) => e.severity === 'error');
              const hasWarn = lineErrors.some((e) => e.severity === 'warning');

              return (
                <div
                  key={num}
                  onClick={() => jumpToLine(num)}
                  style={{
                    color: hasErr ? '#EF4444' : hasWarn ? '#F59E0B' : undefined,
                    fontWeight: hasErr || hasWarn ? 700 : undefined,
                    cursor: 'pointer',
                  }}
                  title={
                    lineErrors.length > 0
                      ? lineErrors.map((e) => e.message).join('\n')
                      : undefined
                  }
                >
                  {num}
                </div>
              );
            })}
          </div>

          {/* Code Textarea Area */}
          <div style={{ flex: 1, position: 'relative', height: '100%', background: '#121418' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onChangeCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={handleCursorMove}
              onClick={handleCursorMove}
              onScroll={handleScroll}
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

            {/* Contextual Autocomplete Popup */}
            {showAutocomplete && (
              <div
                style={{
                  position: 'absolute',
                  top: autocompletePos.top,
                  left: autocompletePos.left,
                  width: 320,
                  maxHeight: 250,
                  background: '#1A1D24',
                  border: '1px solid #00D37D',
                  borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  overflowY: 'auto',
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: '6px 10px',
                    fontSize: 10,
                    color: '#8888A0',
                    borderBottom: '1px solid #282C35',
                  }}
                >
                  STL IntelliSense (Enter və ya Tab ilə daxil et)
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
                      background:
                        selectedAutoIdx === idx ? 'rgba(0,211,125,0.15)' : 'transparent',
                      color: selectedAutoIdx === idx ? '#00D37D' : '#FFF',
                      fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.kind === 'variable' && item.detail.includes('#') && (
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: item.detail.split(' ').pop(),
                            display: 'inline-block',
                          }}
                        />
                      )}
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#8888A0' }}>{item.kind}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Diagnostics Console & Status */}
        <div
          style={{
            height: errors.length > 0 ? 120 : 34,
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
              height: 34,
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
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#00D37D',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 size={13} />
                  Sintaksis xətası yoxdur
                </span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: errors.some((e) => e.severity === 'error') ? '#EF4444' : '#F59E0B',
                      fontWeight: 600,
                    }}
                  >
                    <XCircle size={13} />
                    {errors.length} diaqnostika bildirişi
                  </span>
                  {errors.some((e) => e.suggestion) && (
                    <button
                      type="button"
                      onClick={handleQuickFixAll}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#00D37D',
                        color: '#000',
                        border: 'none',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Hamısını Düzəlt (Quick-Fix)
                    </button>
                  )}
                </div>
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

              <span>•</span>
              <span style={{ fontSize: 10, color: '#6A6A80' }}>
                Avtosave: {autosaveStatus === 'saving' ? 'Saxlanılır...' : 'Saxlandı'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>
                Sətir: {cursorPosition.line}, Sütun: {cursorPosition.col}
              </span>
              <span>UTF-8</span>
              <span>STL v2.0 (P0 Engine)</span>
            </div>
          </div>

          {/* Diagnostics Error List */}
          {errors.length > 0 && (
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '6px 16px',
                background: 'rgba(239,68,68,0.04)',
              }}
            >
              {errors.map((err, i) => {
                const isError = err.severity === 'error';
                return (
                  <div
                    key={i}
                    onClick={() => jumpToLine(err.line)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      color: isError ? '#F87171' : '#FBBF24',
                      padding: '3px 0',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={12} />
                      <span style={{ fontWeight: 700 }}>
                        [{err.code || 'STL'}] Sətir {err.line}:{err.column}
                      </span>
                      <span>{err.message}</span>
                      {err.suggestion && (
                        <span style={{ color: '#00D37D', fontStyle: 'italic' }}>
                          ({err.suggestion})
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: '#8888A0', textDecoration: 'underline' }}>
                      Keçid et
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Command Palette Modal */}
      {showCommandPalette && (
        <div
          onClick={() => setShowCommandPalette(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '15vh',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 500,
              background: '#1A1D24',
              border: '1px solid #333842',
              borderRadius: 12,
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #282C35',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Search size={16} color="#00D37D" />
              <input
                autoFocus
                type="text"
                placeholder="Əmr yazın və ya seçin..."
                value={commandQuery}
                onChange={(e) => {
                  setCommandQuery(e.target.value);
                  setSelectedCmdIdx(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedCmdIdx((prev) => (prev + 1) % filteredCommands.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedCmdIdx(
                      (prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length
                    );
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const cmd = filteredCommands[selectedCmdIdx];
                    if (cmd) {
                      cmd.action();
                      setShowCommandPalette(false);
                    }
                  } else if (e.key === 'Escape') {
                    setShowCommandPalette(false);
                  }
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  background: '#282C35',
                  padding: '2px 6px',
                  borderRadius: 4,
                  color: '#8888A0',
                }}
              >
                ESC bağla
              </span>
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto', padding: 6 }}>
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => {
                      cmd.action();
                      setShowCommandPalette(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: selectedCmdIdx === idx ? 'rgba(0,211,125,0.15)' : 'transparent',
                      color: selectedCmdIdx === idx ? '#00D37D' : '#F0F0F3',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={16} />
                      <span style={{ fontWeight: 500 }}>{cmd.label}</span>
                    </div>
                    {cmd.shortcut && (
                      <span
                        style={{
                          fontSize: 11,
                          color: '#8888A0',
                          background: '#121418',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {cmd.shortcut}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          onClick={() => setShowShortcutsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 440,
              background: '#1A1D24',
              border: '1px solid #333842',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: 0 }}>
                Klaviatura Qısayolları
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8888A0',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'Ctrl + K', desc: 'Command Palette-i aç' },
                { key: 'Ctrl + Shift + F', desc: 'Kodu səliqəli formatla (Beautify)' },
                { key: 'Ctrl + Space', desc: 'IntelliSense / Autocomplete siyahısı' },
                { key: 'Ctrl + S', desc: 'Temanı yadda saxla (Snapshot)' },
                { key: 'Alt + Enter', desc: 'Hamısını düzəlt (Quick-Fix all diagnostics)' },
                { key: 'Ctrl + F', desc: 'Axtar & Əvəz et panelini aç' },
                { key: '?', desc: 'Bu qısayollar cədvəlini aç' },
              ].map((sc, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    borderBottom: '1px solid #22262E',
                    paddingBottom: 6,
                  }}
                >
                  <span style={{ color: '#C0C0D0' }}>{sc.desc}</span>
                  <span
                    style={{
                      background: '#121418',
                      color: '#00D37D',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    {sc.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
