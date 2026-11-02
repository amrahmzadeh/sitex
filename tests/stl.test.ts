import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenizeSTL,
  parseSTL,
  compileSTL,
  stringifySTL,
  themeConfigToSTL,
  convertSTLToThemeDefinition,
} from '../src/modules/stl';

const sampleSTL = `
theme "MyProfessionalTheme" {
  meta {
    name: "My Professional Theme"
    version: "1.0.0"
    author: "SiteX User"
    description: "Professional website theme"
  }

  colors {
    primary: "#6366F1"
    secondary: "#0F172A"
    background: "#FFFFFF"
    surface: "#F8FAFC"
    text: "#1E293B"
    accent: "#F59E0B"
  }

  typography {
    heading: "Inter"
    body: "Inter"
    baseSize: "16px"
  }

  layout {
    containerWidth: "1200px"
    borderRadius: "12px"
    spacing: "16px"
  }

  components {
    button {
      background: colors.primary
      color: "#FFFFFF"
      radius: "8px"
    }

    card {
      background: colors.surface
      radius: "12px"
      shadow: "0 4px 12px rgba(0,0,0,0.08)"
    }
  }
}
`;

test('STL Tokenizer: STL kodunu düzgün tokenlərə ayırır', () => {
  const { tokens, errors } = tokenizeSTL(sampleSTL);
  assert.equal(errors.length, 0);
  assert.ok(tokens.length > 20);

  const themeKeyword = tokens.find((t) => t.type === 'KEYWORD' && t.value === 'theme');
  assert.ok(themeKeyword);

  const colorsKeyword = tokens.find((t) => t.type === 'KEYWORD' && t.value === 'colors');
  assert.ok(colorsKeyword);
});

test('STL Parser: AST və blokları düzgün qurur', () => {
  const { ast, errors } = parseSTL(sampleSTL);
  assert.equal(errors.length, 0);
  assert.ok(ast);

  assert.equal(ast.id, 'MyProfessionalTheme');
  assert.equal(ast.meta.name, 'My Professional Theme');
  assert.equal(ast.colors.primary, '#6366F1');
  assert.equal(ast.colors.secondary, '#0F172A');
  assert.equal(ast.typography.heading, 'Inter');
  assert.equal(ast.layout.containerWidth, '1200px');
  assert.equal(ast.components.button.background, 'colors.primary');
});

test('STL Compiler: Dəyişənləri və CSS xassələrini hesablayır', () => {
  const { ast } = parseSTL(sampleSTL);
  assert.ok(ast);

  const result = compileSTL(ast);
  assert.equal(result.success, true);
  assert.ok(result.theme);

  // Variable substitution check: colors.primary -> #6366F1
  assert.equal(result.theme.components.button.background, '#6366F1');
  assert.equal(result.cssVariables['--sitex-primary'], '#6366F1');
  assert.ok(result.compiledCss.includes('.sitex-theme-preview'));
});

test('STL Serializer: AST-dən təmiz STL mətni yaradır və yenidən parse edilə bilir', () => {
  const { ast } = parseSTL(sampleSTL);
  assert.ok(ast);

  const stringified = stringifySTL(ast);
  assert.ok(stringified.includes('theme "MyProfessionalTheme"'));
  assert.ok(stringified.includes('colors {'));

  const reParsed = parseSTL(stringified);
  assert.equal(reParsed.errors.length, 0);
  assert.equal(reParsed.ast?.colors.primary, '#6366F1');
});

test('STL ThemeConfig dönüşümü və ThemeDefinition inteqrasiyası', () => {
  const stlCode = themeConfigToSTL({
    id: 'test-theme',
    name: 'Test Tema',
    primaryColor: '#FF6B35',
  });

  assert.ok(stlCode.includes('#FF6B35'));

  const { ast } = parseSTL(stlCode);
  assert.ok(ast);

  const themeDef = convertSTLToThemeDefinition(ast);
  assert.equal(themeDef.tokens.colors.primary, '#FF6B35');
  assert.equal(themeDef.source, 'custom');
});
