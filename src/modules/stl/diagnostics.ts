export const STL_DIAGNOSTICS = {
  SYNTAX_ERROR: 'STL1001',
  MISSING_BRACE: 'STL1002',
  MISSING_COLON: 'STL1003',
  UNKNOWN_KEY: 'STL1004',
  UNDEFINED_VARIABLE: 'STL1005',
  INVALID_TYPE: 'STL1006',
  SECURITY_VIOLATION: 'STL1007',
  CIRCULAR_DEPENDENCY: 'STL1008',
  CONTRAST_WARNING: 'STL2001',
} as const;

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

export function findBestSuggestion(word: string, candidates: string[], maxDistance = 3): string | undefined {
  if (!word || candidates.length === 0) return undefined;
  const lower = word.toLowerCase();

  let bestCandidate: string | undefined = undefined;
  let minDistance = maxDistance + 1;

  for (const cand of candidates) {
    if (cand.toLowerCase() === lower) continue;
    const dist = levenshteinDistance(lower, cand.toLowerCase());
    if (dist < minDistance) {
      minDistance = dist;
      bestCandidate = cand;
    }
  }

  return bestCandidate;
}

