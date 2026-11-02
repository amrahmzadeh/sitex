import { STLThemeNode, STLError } from './types';

const SAFE_COLOR_REGEX = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|transparent|currentColor|[a-zA-Z]+)$/;
const SAFE_DIMENSION_REGEX = /^-?[0-9]+(\.[0-9]+)?(px|rem|em|%|vh|vw|pt)?$/;
const DANGEROUS_PATTERNS = [
  /javascript:/i,
  /expression\s*\(/i,
  /<script/i,
  /data:text\/html/i,
  /behavior\s*:/i,
  /-moz-binding/i,
];

export function validateSTLTheme(theme: STLThemeNode): STLError[] {
  const errors: STLError[] = [];

  const checkSafety = (val: string, keyName: string) => {
    for (const pat of DANGEROUS_PATTERNS) {
      if (pat.test(val)) {
        errors.push({
          message: `'${keyName}' daxilində təhlükəsiz olmayan ifadə aşkar edildi: ${val}`,
          line: 1,
          column: 1,
          severity: 'error',
        });
      }
    }
  };

  // Check Colors
  for (const [key, color] of Object.entries(theme.colors)) {
    checkSafety(color, `colors.${key}`);
    if (!color.includes('.') && !SAFE_COLOR_REGEX.test(color)) {
      errors.push({
        message: `'colors.${key}' üçün etibarsız rəng formatı: '${color}'`,
        line: 1,
        column: 1,
        severity: 'warning',
      });
    }
  }

  // Check Typography
  for (const [key, val] of Object.entries(theme.typography)) {
    checkSafety(val, `typography.${key}`);
  }

  // Check Layout
  for (const [key, val] of Object.entries(theme.layout)) {
    checkSafety(val, `layout.${key}`);
    if (key.toLowerCase().includes('width') || key.toLowerCase().includes('radius') || key.toLowerCase().includes('spacing')) {
      if (!val.includes('.') && !SAFE_DIMENSION_REGEX.test(val)) {
        errors.push({
          message: `'layout.${key}' üçün gözlənilən ölçü vahidi aşkar edilmədi: '${val}' (məsələn: 1200px, 16px)`,
          line: 1,
          column: 1,
          severity: 'warning',
        });
      }
    }
  }

  // Check Components
  for (const [compName, compProps] of Object.entries(theme.components)) {
    for (const [propKey, propVal] of Object.entries(compProps)) {
      checkSafety(propVal, `components.${compName}.${propKey}`);
    }
  }

  return errors;
}
