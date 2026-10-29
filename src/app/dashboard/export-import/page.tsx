'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Upload, CheckCircle, AlertCircle, FileJson,
  Loader2, ChevronDown, ChevronUp, Trash2, ArrowRightLeft,
  Check, Info, FileCheck, Layers
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface ImportOptions {
  importTheme: boolean;
  importMenu: boolean;
  importSettings: boolean;
  importWhatsapp: boolean;
  importSocialLinks: boolean;
  importWorkingHours: boolean;
  clearExistingMenu: boolean;
}

export default function ExportImportPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any>(null);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<string[]>([]);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    importTheme: true,
    importMenu: true,
    importSettings: true,
    importWhatsapp: true,
    importSocialLinks: true,
    importWorkingHours: true,
    clearExistingMenu: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations?.length) {
          setOrgs(d.organizations);
          const saved = localStorage.getItem('currentOrgId');
          const found = d.organizations.find((o: Organization) => o.id === saved);
          setCurrentOrg(found || d.organizations[0]);
        }
      });
  }, []);

  const handleExport = async () => {
    if (!currentOrg) return;
    setExporting(true);
    setExportSuccess(false);
    try {
      const res = await fetch(`/api/organizations/${currentOrg.id}/export`);
      if (!res.ok) throw new Error('Export xətası');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `site-export-${currentOrg.slug}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError('');
    setImportResults([]);
    setImportData(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.version || !parsed.site) {
          setImportError('Keçərsiz export faylı formatı.');
          return;
        }
        setImportData(parsed);
      } catch {
        setImportError('JSON oxunarkən xəta baş verdi. Düzgün fayl seçin.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!currentOrg || !importData) return;
    setImporting(true);
    setImportResults([]);
    setImportError('');
    try {
      const res = await fetch(`/api/organizations/${currentOrg.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: importData, ...importOptions }),
      });
      const json = await res.json();
      if (!res.ok) {
        setImportError(json.error || 'Import zamanı xəta baş verdi');
        return;
      }
      setImportResults(json.results || []);
    } catch {
      setImportError('Şəbəkə xətası baş verdi');
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportData(null);
    setImportError('');
    setImportResults([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ArrowRightLeft size={28} color="#7C5CFC" /> Export & Import
        </h1>
        <p style={{ color: '#8888A0', fontSize: 14, marginTop: 4 }}>
          Saytınızın tam konfiqurasiyasını yedəkləyin və ya başqa saytdan köçürün
        </p>
      </div>

      {/* Org Selector */}
      {orgs.length > 1 && (
        <div className="dash-card" style={{ padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#8888A0' }}>Aktiv Sayt:</span>
          <select
            className="dash-input"
            style={{ width: 'auto', minWidth: 200, padding: '6px 12px', fontSize: 13 }}
            value={currentOrg?.id ?? ''}
            onChange={(e) => {
              const org = orgs.find((o) => o.id === e.target.value);
              if (org) {
                setCurrentOrg(org);
                localStorage.setItem('currentOrgId', org.id);
              }
            }}
          >
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#1A1A24', padding: 4, borderRadius: 12, border: '1px solid #2A2A3A' }}>
        <button
          onClick={() => setActiveTab('export')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
            background: activeTab === 'export' ? '#7C5CFC' : 'transparent',
            color: activeTab === 'export' ? '#FFF' : '#8888A0',
          }}
        >
          <Download size={16} /> Export (Yedəklə)
        </button>
        <button
          onClick={() => setActiveTab('import')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
            background: activeTab === 'import' ? '#7C5CFC' : 'transparent',
            color: activeTab === 'import' ? '#FFF' : '#8888A0',
          }}
        >
          <Upload size={16} /> Import (Bərpa Et)
        </button>
      </div>

      {/* TAB CONTENT: EXPORT */}
      {activeTab === 'export' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="dash-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124, 92, 252, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={22} color="#7C5CFC" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0' }}>Tam Sayt Exportu</h2>
                <p style={{ fontSize: 13, color: '#8888A0', marginTop: 2 }}>
                  Mövcud saytınızın bütün struktur və parametrlərini JSON formatında kompüterinizə endirir
                </p>
              </div>
            </div>

            <div style={{ background: '#12121A', borderRadius: 12, border: '1px solid #22222E', padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#8888A0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Yedəkləmə faylına daxil olan bölmələr:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  'Sayt əsas məlumatları & əlaqə',
                  'Tema dizaynı, rənglər & fontlar',
                  'Menyu kateqoriyaları & yeməklər',
                  'WhatsApp & sifariş konfiqurasiyası',
                  'Sosial media bağlantıları',
                  'İş saatları cədvəli',
                  'Splash animasiya ekranı',
                  'Səhifə strukturları',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#E8E8F0' }}>
                    <CheckCircle size={15} color="#34D399" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Info size={16} color="#FBBF24" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#FBBF24', margin: 0 }}>
                Şəkillərin fayl həcmi böyük olduğundan yalnız şəkil URL linkləri saxlanılır.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleExport}
                disabled={exporting || !currentOrg}
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px' }}
              >
                {exporting ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : exportSuccess ? (
                  <Check size={16} />
                ) : (
                  <Download size={16} />
                )}
                {exporting ? 'Yedəklənir...' : exportSuccess ? 'Fayl Endirildi!' : 'Export Et (JSON Yüklə)'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB CONTENT: IMPORT */}
      {activeTab === 'import' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="dash-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={22} color="#34D399" />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#E8E8F0' }}>Export Faylını Bərpa Et</h2>
                <p style={{ fontSize: 13, color: '#8888A0', marginTop: 2 }}>
                  Daha əvvəl endirilmiş .json faylını seçərək cari saytınıza köçürün
                </p>
              </div>
            </div>

            {/* File dropzone / selected file */}
            <div style={{ marginBottom: 20 }}>
              {!importFile ? (
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32,
                    border: '2px dashed #2A2A3A',
                    borderRadius: 14,
                    cursor: 'pointer',
                    background: '#12121A',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#7C5CFC';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(124, 92, 252, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2A2A3A';
                    (e.currentTarget as HTMLElement).style.background = '#12121A';
                  }}
                >
                  <FileJson size={36} color="#7C5CFC" style={{ marginBottom: 10 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0' }}>Export faylını seçin (.json)</span>
                  <span style={{ fontSize: 12, color: '#8888A0', marginTop: 4 }}>və ya faylı buraya sürükləyin</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#12121A', border: '1px solid #2A2A3A', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileCheck size={24} color="#34D399" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#E8E8F0' }}>{importFile.name}</p>
                      {importData && (
                        <p style={{ fontSize: 12, color: '#34D399', marginTop: 2 }}>
                          ✓ Orijinal sayt: <b>{importData.site?.name || 'Məlum deyil'}</b> ({importData.exportedAt?.split('T')[0]})
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={resetImport}
                    style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer', padding: 6 }}
                    title="Faylı çıxart"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Error box */}
            {importError && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '12px 16px', color: '#F87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{importError}</span>
              </div>
            )}

            {/* Select options */}
            {importData && (
              <div style={{ background: '#12121A', borderRadius: 12, border: '1px solid #22222E', padding: 18, marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E8E8F0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} color="#7C5CFC" /> Köçürüləcək məlumatları seçin:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {[
                    { key: 'importSettings', label: 'Əsas məlumatlar (ad, ünvan)' },
                    { key: 'importTheme', label: 'Tema & vizual dizayn' },
                    { key: 'importMenu', label: 'Menyu və kateqoriyalar' },
                    { key: 'importWhatsapp', label: 'WhatsApp parametrləri' },
                    { key: 'importSocialLinks', label: 'Sosial şəbəkə linkləri' },
                    { key: 'importWorkingHours', label: 'İş saatları cədvəli' },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#E8E8F0' }}>
                      <input
                        type="checkbox"
                        style={{ accentColor: '#7C5CFC', width: 16, height: 16 }}
                        checked={importOptions[key as keyof ImportOptions] as boolean}
                        onChange={(e) =>
                          setImportOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                {/* Advanced menu clean option */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #22222E' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{ background: 'transparent', border: 'none', color: '#8888A0', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                  >
                    {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    Qabaqcıl parametrlər
                  </button>

                  {showAdvanced && (
                    <div style={{ marginTop: 10, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 10, padding: '10px 14px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#F87171', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          style={{ accentColor: '#F87171', width: 16, height: 16 }}
                          checked={importOptions.clearExistingMenu}
                          onChange={(e) =>
                            setImportOptions((prev) => ({ ...prev, clearExistingMenu: e.target.checked }))
                          }
                        />
                        <span>Mövcud menyu kateqoriyalarını və məhsullarını əvvəlcə tamamilə sil</span>
                      </label>
                      <p style={{ fontSize: 11, color: '#8888A0', marginTop: 4, marginLeft: 24 }}>
                        Qeyd: Bu seçim aktiv olmadıqda, menyu mövcud olanların üzərinə birləşdiriləcək.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Results box */}
            {importResults.length > 0 && (
              <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#34D399', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} /> Import uğurla tamamlandı:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {importResults.map((r) => (
                    <div key={r} style={{ fontSize: 13, color: '#E8E8F0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#34D399' }}>•</span> {r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {importData && (
                <button
                  type="button"
                  onClick={resetImport}
                  className="dash-btn-secondary"
                  style={{ fontSize: 13, padding: '10px 18px' }}
                >
                  Ləğv et
                </button>
              )}
              <button
                onClick={handleImport}
                disabled={!importData || importing}
                className="dash-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px' }}
              >
                {importing ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Upload size={16} />
                )}
                {importing ? 'Import edilir...' : 'Seçilənləri Import Et'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
