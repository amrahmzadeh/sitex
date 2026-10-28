import { NextResponse } from 'next/server';
import { existsSync, readdirSync } from 'fs';
import path from 'path';

function getSiteRoot(cwd: string) {
  if (cwd.includes('versions')) return cwd.split(/versions[/\\]/)[0];
  if (cwd.includes('current')) return path.dirname(cwd);
  return cwd;
}

function listDeep(dir: string, depth = 2): string[] {
  if (!existsSync(dir)) return [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const result: string[] = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      result.push(full);
      if (e.isDirectory() && depth > 1) {
        result.push(...listDeep(full, depth - 1));
      }
    }
    return result;
  } catch { return []; }
}

export async function GET() {
  const cwd = process.cwd();
  const siteRoot = getSiteRoot(cwd);

  const dirs = {
    'cwd': cwd,
    'siteRoot': siteRoot,
    'siteRoot/shared_uploads': path.join(siteRoot, 'shared_uploads'),
    'siteRoot/uploads': path.join(siteRoot, 'uploads'),
    'cwd/public/uploads': path.join(cwd, 'public', 'uploads'),
  };

  const foundFiles: string[] = [];
  function scanForImages(dir: string, currentDepth = 0) {
    if (currentDepth > 5 || !existsSync(dir)) return;
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          if (!e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== '.next') {
            scanForImages(full, currentDepth + 1);
          }
        } else {
          if (e.name.includes('179319') || e.name.includes('179321') || e.name.endsWith('.png') || e.name.endsWith('.jpg')) {
            foundFiles.push(full);
          }
        }
      }
    } catch {}
  }

  // Scan siteRoot, /home/u310078278/domains/onlive.az, etc.
  scanForImages(siteRoot);
  scanForImages('/home/u310078278/domains/onlive.az');
  scanForImages(path.join(siteRoot, '..'));

  const result: Record<string, { exists: boolean; files: string[] }> = {};
  for (const [label, dir] of Object.entries(dirs)) {
    result[label] = {
      exists: existsSync(dir),
      files: listDeep(dir, 3),
    };
  }

  return NextResponse.json({ cwd, siteRoot, foundFiles, uploadDirs: result });
}
