import { STLThemeNode, STLError } from './types';
import { STL_DIAGNOSTICS, findBestSuggestion } from './diagnostics';
import { checkWCAGContrast } from './colorUtils';

const SAFE_COLOR_REGEX =
  /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|transparent|currentColor|[a-zA-Z]+)$/;
const SAFE_DIMENSION_REGEX =
  /^-?[0-9]+(\.[0-9]+)?(px|rem|em|%|vh|vw|pt|s|ms)?$/;

const DANGEROUS_PATTERNS = [
  /javascript:/i,
  /expression\s*\(/i,
  /<script/i,
  /data:text\/html/i,
  /behavior\s*:/i,
  /-moz-binding/i,
  /vbscript:/i,
  /url\s*\(\s*['"]?\s*(javascript|data:text\/html|vbscript):/i,
];

const STANDARD_COLOR_KEYS = [
  'primary',
  'secondary',
  'accent',
  'background',
  'surface',
  'text',
  'mutedText',
  'border',
];

const STANDARD_LAYOUT_KEYS = [
  'containerWidth',
  'borderRadius',
  'spacing',
  'gap',
  'padding',
  'maxWidth',
];

export function validateSTLTheme(theme: STLThemeNode): STLError[] {
  const errors: STLError[] = [];

  const checkSafety = (val: string, keyName: string): boolean => {
    let hasViolation = false;
    for (const pat of DANGEROUS_PATTERNS) {
      if (pat.test(val)) {
        errors.push({
          code: STL_DIAGNOSTICS.SECURITY_VIOLATION,
          message: `'${keyName}' daxilində təhlükəsiz olmayan ifadə aşkar edildi: ${val}`,
          line: 1,
          column: 1,
          severity: 'error',
        });
        hasViolation = true;
      }
    }
    return hasViolation;
  };

  const isColorFunctionOrVar = (val: string): boolean => {
    return (
      val.startsWith('colors.') ||
      val.startsWith('tokens.') ||
      val.startsWith('lighten(') ||
      val.startsWith('darken(') ||
      val.startsWith('alpha(') ||
      val.startsWith('mix(')
    );
  };

  // 1. Check Colors
  for (const [key, color] of Object.entries(theme.colors || {})) {
    const isViolated = checkSafety(color, `colors.${key}`);
    if (isViolated) continue;

    // Suggest typos in standard color names
    if (!STANDARD_COLOR_KEYS.includes(key)) {
      const suggestion = findBestSuggestion(key, STANDARD_COLOR_KEYS, 2);
      if (suggestion) {
        errors.push({
          code: STL_DIAGNOSTICS.UNKNOWN_KEY,
          message: `'colors.${key}' standart rəng açarı deyil.`,
          suggestion: `Bunu demək istəyirdiniz: '${suggestion}'?`,
          line: 1,
          column: 1,
          severity: 'info',
        });
      }
    }

    if (!isColorFunctionOrVar(color) && !SAFE_COLOR_REGEX.test(color)) {
      errors.push({
        code: STL_DIAGNOSTICS.INVALID_TYPE,
        message: `'colors.${key}' üçün etibarsız rəng formatı: '${color}'`,
        line: 1,
        column: 1,
        severity: 'warning',
      });
    }
  }

  // 2. Check Typography
  for (const [key, val] of Object.entries(theme.typography || {})) {
    checkSafety(val, `typography.${key}`);
  }

  // 3. Check Layout
  for (const [key, val] of Object.entries(theme.layout || {})) {
    checkSafety(val, `layout.${key}`);
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('width') ||
      lowerKey.includes('radius') ||
      lowerKey.includes('spacing') ||
      lowerKey.includes('gap')
    ) {
      if (!val.includes('.') && !SAFE_DIMENSION_REGEX.test(val)) {
        errors.push({
          code: STL_DIAGNOSTICS.INVALID_TYPE,
          message: `'layout.${key}' üçün gözlənilən ölçü vahidi aşkar edilmədi: '${val}' (məsələn: 1200px, 16px)`,
          line: 1,
          column: 1,
          severity: 'warning',
        });
      }
    }
  }

  // 4. Check Tokens
  if (theme.tokens) {
    for (const [category, catTokens] of Object.entries(theme.tokens)) {
      for (const [tokenKey, tokenVal] of Object.entries(catTokens)) {
        checkSafety(tokenVal, `tokens.${category}.${tokenKey}`);
      }
    }
  }

  // 5. Check Components
  for (const [compName, compProps] of Object.entries(theme.components || {})) {
    for (const [propKey, propVal] of Object.entries(compProps)) {
      checkSafety(propVal, `components.${compName}.${propKey}`);

      // Check undefined variable references
      if (propVal.startsWith('colors.')) {
        const colorVarName = propVal.slice('colors.'.length);
        if (theme.colors && !(colorVarName in theme.colors)) {
          const sug = findBestSuggestion(colorVarName, Object.keys(theme.colors));
          errors.push({
            code: STL_DIAGNOSTICS.UNDEFINED_VARIABLE,
            message: `'${propVal}' dəyişəni 'colors' blokunda tapılmadı.`,
            suggestion: sug ? `Bunu demək istəyirdiniz: 'colors.${sug}'?` : undefined,
            line: 1,
            column: 1,
            severity: 'warning',
          });
        }
      }
    }
  }

  // 6. WCAG Contrast Check
  if (theme.colors?.text && theme.colors?.background) {
    // Only test if both are raw colors (not unresolved variables)
    if (SAFE_COLOR_REGEX.test(theme.colors.text) && SAFE_COLOR_REGEX.test(theme.colors.background)) {
      const contrast = checkWCAGContrast(theme.colors.text, theme.colors.background);
      if (contrast && !contrast.aaPass) {
        errors.push({
          code: STL_DIAGNOSTICS.CONTRAST_WARNING,
          message: `WCAG Kontrast Xəbərdarlığı: Mətn ('${theme.colors.text}') və Fon ('${theme.colors.background}') arasındakı kontrast nisbəti ${contrast.ratio}:1 səviyyəsindədir. AA standartı üçün ən azı 4.5:1 tələb olunur.`,
          line: 1,
          column: 1,
          severity: 'warning',
        });
      }
    }
  }

  // Check button text vs background contrast
  const btnColor = theme.components?.button?.color;
  let btnBg = theme.components?.button?.background;
  if (btnBg && btnBg.startsWith('colors.') && theme.colors) {
    btnBg = theme.colors[btnBg.slice('colors.'.length)];
  }
  if (btnColor && btnBg && SAFE_COLOR_REGEX.test(btnColor) && SAFE_COLOR_REGEX.test(btnBg)) {
    const btnContrast = checkWCAGContrast(btnColor, btnBg);
    if (btnContrast && !btnContrast.aaLargePass) {
      errors.push({
        code: STL_DIAGNOSTICS.CONTRAST_WARNING,
        message: `WCAG Kontrast Xəbərdarlığı: Düymə mətni ('${btnColor}') və fonu ('${btnBg}') arasındakı kontrast nisbəti ${btnContrast.ratio}:1 səviyyəsindədir. Düymələr üçün ən azı 3.0:1 tələb olunur.`,
        line: 1,
        column: 1,
        severity: 'warning',
      });
    }
  }

  return errors;
}
