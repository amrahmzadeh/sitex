'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Download, Upload, CheckCircle, AlertCircle, FileJson,
  Loader2, ChevronDown, ChevronUp, Trash2,
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
  const { data: session } = useSession();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<Record<string, unknown> | null>(null);
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
      setTimeout(() => setExportSuccess(false), 3000);
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
          setImportError('Keçərsiz export faylı formatı');
          return;
        }
        setImportData(parsed);
      } catch {
        setImportError('JSON oxuma xətası. Düzgün export faylı seçin.');
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
        setImportError(json.error || 'Import xətası');
        return;
      }
      setImportResults(json.results || []);
    } catch {
      setImportError('Şəbəkə xətası');
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

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export / Import</h1>
        <p className="text-gray-500 mt-1 text-sm">Sayt məlumatlarını yedəkləyin və ya başqa sayta köçürün</p>
      </div>

      {/* Org selector */}
      {orgs.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Sayt:</label>
          <select
            className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
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

      {/* EXPORT */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Download className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Saytı Export Et</h2>
            <p className="text-xs text-gray-500">JSON formatında tam yedəkləmə</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-2 mb-5 text-sm text-gray-600">
            {[
              'Əsas məlumatlar (ad, telefon, ünvan)',
              'Tema və dizayn ayarları',
              'Menyu kateqoriyaları və məhsullar',
              'WhatsApp ayarları',
              'Sosial media linkləri',
              'İş saatları',
              'Splash screen konfiqurasiyası',
              'Səhifə konfiqurasiyaları',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            ⚠️ Şəkillər export edilmir — yalnız URL-lər saxlanılır
          </p>
          <button
            onClick={handleExport}
            disabled={exporting || !currentOrg}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-60 transition-colors"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : exportSuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? 'Export edilir...' : exportSuccess ? 'Yükləndi!' : 'Export Et'}
          </button>
        </div>
      </motion.div>

      {/* IMPORT */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Saytı Import Et</h2>
            <p className="text-xs text-gray-500">Export faylından məlumatları yükləyin</p>
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export faylı (.json)</label>
            {!importFile ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                <FileJson className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">JSON faylı seçin</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">{importFile.name}</span>
                  {importData && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      ✓ {(importData.site as { name?: string })?.name ?? 'Fayl oxundu'}
                    </span>
                  )}
                </div>
                <button onClick={resetImport} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Import error */}
          {importError && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {importError}
            </div>
          )}

          {/* Import options */}
          {importData && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Nə import edilsin?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'importSettings', label: 'Əsas məlumatlar' },
                  { key: 'importTheme', label: 'Tema & dizayn' },
                  { key: 'importMenu', label: 'Menyu' },
                  { key: 'importWhatsapp', label: 'WhatsApp ayarları' },
                  { key: 'importSocialLinks', label: 'Sosial linklər' },
                  { key: 'importWorkingHours', label: 'İş saatları' },
                ] .map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-orange-500 w-4 h-4"
                      checked={importOptions[key as keyof ImportOptions] as boolean}
                      onChange={(e) =>
                        setImportOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              {/* Advanced */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Ətraflı parametrlər
              </button>
              {showAdvanced && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-red-500 w-4 h-4"
                      checked={importOptions.clearExistingMenu}
                      onChange={(e) =>
                        setImportOptions((prev) => ({ ...prev, clearExistingMenu: e.target.checked }))
                      }
                    />
                    <span className="text-sm text-red-700 font-medium">
                      Mövcud menyunu tamamilə sil, sonra import et
                    </span>
                  </label>
                  <p className="text-xs text-red-500">⚠️ Bu seçim mövcud bütün menyu məlumatlarını siləcək!</p>
                </div>
              )}
            </div>
          )}

          {/* Import results */}
          {importResults.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 space-y-1">
              <p className="text-sm font-medium text-green-800 mb-2">✓ Import tamamlandı</p>
              {importResults.map((r) => (
                <div key={r} className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {r}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleImport}
              disabled={!importData || importing}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {importing ? 'Import edilir...' : 'Import Et'}
            </button>
            {importData && (
              <button
                onClick={resetImport}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
              >
                Ləğv et
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info note */}
      <div className="text-xs text-gray-400 text-center pb-4">
        Export faylınızı etibarlı yerdə saxlayın. Şifrələr və şəkil faylları export edilmir.
      </div>
    </div>
  );
}

