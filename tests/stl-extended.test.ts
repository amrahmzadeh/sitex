import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSTL,
  compileSTL,
  stringifySTL,
  tokenizeSTL,
  validateSTLTheme,
  STL_DIAGNOSTICS,
  checkWCAGContrast,
  lightenColor,
  darkenColor,
  alphaColor,
  mixColors,
} from '../src/modules/stl';

test('STL Extended: Tokens bloku və token istinadları', () => {
  const code = `
theme "TokenizedTheme" {
  tokens {
    spacing {
      sm: "8px"
      md: "16px"
      lg: "24px"
    }
    radius {
      sm: "4px"
      md: "8px"
    }
  }

  colors {
    primary: "#00D37D"
    background: "#0F1115"
  }

  layout {
    spacing: tokens.spacing.md
    borderRadius: {tokens.radius.md}
  }
}
  `;

  const { ast, errors } = parseSTL(code);
  assert.equal(errors.filter((e) => e.severity === 'error').length, 0);
  assert.ok(ast);
  assert.equal(ast.tokens?.spacing?.sm, '8px');
  assert.equal(ast.tokens?.spacing?.md, '16px');

  const compiled = compileSTL(ast);
  assert.equal(compiled.success, true);
  assert.equal(compiled.theme?.layout?.spacing, '16px');
  assert.equal(compiled.theme?.layout?.borderRadius, '8px');
  assert.equal(compiled.cssVariables['--sitex-token-spacing-md'], '16px');
});

test('STL Extended: Modes (Light & Dark) və CSS media/data-theme generasiyası', () => {
  const code = `
theme "AdaptiveTheme" {
  colors {
    primary: "#00D37D"
    background: "#FFFFFF"
    text: "#111111"
  }

  modes {
    dark {
      colors {
        background: "#0D0E11"
        text: "#F5F5F7"
      }
    }
  }
}
  `;

  const { ast, errors } = parseSTL(code);
  assert.equal(errors.filter((e) => e.severity === 'error').length, 0);
  assert.ok(ast?.modes?.dark);

  const compiled = compileSTL(ast!);
  assert.equal(compiled.success, true);
  assert.ok(compiled.compiledCss.includes('[data-theme="dark"]'));
  assert.ok(compiled.compiledCss.includes('@media (prefers-color-scheme: dark)'));
  assert.ok(compiled.compiledCss.includes('--sitex-background: #0D0E11;'));
});

test('STL Extended: Responsive overrides (Mobile & Tablet)', () => {
  const code = `
theme "ResponsiveTheme" {
  layout {
    containerWidth: "1200px"
    spacing: "24px"
  }

  responsive {
    mobile {
      layout {
        containerWidth: "100%"
        spacing: "12px"
      }
    }
  }
}
  `;

  const { ast, errors } = parseSTL(code);
  assert.equal(errors.filter((e) => e.severity === 'error').length, 0);
  assert.ok(ast?.responsive?.mobile);

  const compiled = compileSTL(ast!);
  assert.equal(compiled.success, true);
  assert.ok(compiled.compiledCss.includes('@media (max-width: 640px)'));
  assert.ok(compiled.compiledCss.includes('--sitex-container-width: 100%;'));
});

test('STL Extended: Rəng hesablama funksiyaları (lighten, darken, alpha, mix)', () => {
  assert.equal(lightenColor('#000000', 50), '#808080');
  assert.equal(darkenColor('#ffffff', 50), '#808080');
  assert.equal(alphaColor('#ff0000', 0.5), 'rgba(255, 0, 0, 0.5)');
  assert.equal(mixColors('#000000', '#ffffff', 50), '#808080');

  const code = `
theme "ColorFunctionTheme" {
  colors {
    primary: "#008000"
    lighterPrimary: lighten(colors.primary, 20%)
    fadedPrimary: alpha(colors.primary, 0.5)
    mixed: mix(colors.primary, #ffffff, 50%)
  }
}
  `;

  const { ast, errors } = parseSTL(code);
  assert.equal(errors.filter((e) => e.severity === 'error').length, 0);
  assert.ok(ast);

  const compiled = compileSTL(ast);
  assert.equal(compiled.success, true);
  assert.ok(compiled.theme?.colors.lighterPrimary.startsWith('#'));
  assert.ok(compiled.theme?.colors.fadedPrimary.startsWith('rgba('));
});

test('STL Extended: Parser xəta bərpası (error recovery)', () => {
  // Line with a syntax error in middle of blocks
  const invalidCode = `
theme "RecoveryTheme" {
  colors {
    primary: "#00D37D"
    bad_property_without_colon
    secondary: "#1A1A2E"
  }

  typography {
    heading: "Inter"
  }
}
  `;

  const { ast, errors } = parseSTL(invalidCode);
  // Parser should recover and still parse secondary color and typography block!
  assert.ok(errors.length > 0);
  assert.ok(errors.some((e) => e.code === STL_DIAGNOSTICS.MISSING_COLON));
  assert.ok(ast);
  assert.equal(ast.colors.primary, '#00D37D');
  assert.equal(ast.colors.secondary, '#1A1A2E');
  assert.equal(ast.typography.heading, 'Inter');
});

test('STL Extended: Levenshtein təklifləri (Fuzzy matching)', () => {
  const codeWithTypo = `
theme "TypoTheme" {
  colros {
    primry: "#00D37D"
  }
}
  `;

  const { errors } = parseSTL(codeWithTypo);
  const typoError = errors.find((e) => e.suggestion?.includes('colors'));
  assert.ok(typoError, 'Should suggest "colors" for "colros"');
});

test('STL Extended: WCAG Kontrast yoxlanışı', () => {
  // Low contrast: light yellow text (#ffff88) on white background (#ffffff)
  const lowContrastTheme = `
theme "LowContrastTheme" {
  colors {
    background: "#ffffff"
    text: "#ffff88"
  }
}
  `;

  const { ast } = parseSTL(lowContrastTheme);
  assert.ok(ast);
  const errors = validateSTLTheme(ast);
  const contrastErr = errors.find((e) => e.code === STL_DIAGNOSTICS.CONTRAST_WARNING);
  assert.ok(contrastErr, 'Should detect WCAG contrast violation');
  assert.equal(contrastErr.severity, 'warning');
});

test('STL Extended: Təhlükəsizlik və XSS filtrləri', () => {
  const maliciousCode = `
theme "XssTheme" {
  colors {
    primary: "javascript:alert(1)"
    secondary: "expression(alert(1))"
    accent: "<script>evil()</script>"
    background: "url('javascript:void(0)')"
  }
}
  `;

  const { ast } = parseSTL(maliciousCode);
  assert.ok(ast);
  const validationErrors = validateSTLTheme(ast);
  assert.ok(validationErrors.length >= 4);
  assert.ok(validationErrors.every((e) => e.code === STL_DIAGNOSTICS.SECURITY_VIOLATION));
});

test('STL Extended: Çoxfayllı import və dövri asılılıq yoxlaması', () => {
  const codeWithImport = `
import "colors.stl"
import "base.stl"

theme "MultiFileTheme" {
  colors {
    primary: "#00D37D"
  }
}
  `;

  const { ast } = parseSTL(codeWithImport);
  assert.ok(ast?.imports);
  assert.deepEqual(ast.imports, ['colors.stl', 'base.stl']);

  // Test circular import detection
  const circularResult = parseSTL('import "loop.stl"\ntheme "LoopTheme" {}', {
    fileMap: { 'loop.stl': 'import "main.stl"' },
    currentFile: 'loop.stl',
    visitedFiles: new Set(['loop.stl']),
  });

  const circularErr = circularResult.errors.find((e) => e.code === STL_DIAGNOSTICS.CIRCULAR_DEPENDENCY);
  assert.ok(circularErr, 'Should detect circular dependency');
});

test('STL Extended: Idempotent Formatter və şərhlərin qorunması', () => {
  const code = `// Əsas tema şərhi
theme "FormattedTheme" {
  meta {
    name: "Formatted Theme"
  }

  colors {
    primary: "#00D37D"
    secondary: "#1A1A2E"
  }
}
`;

  const { ast: ast1 } = parseSTL(code);
  assert.ok(ast1);
  const stringified1 = stringifySTL(ast1);
  assert.ok(stringified1.includes('// Əsas tema şərhi'));

  const { ast: ast2 } = parseSTL(stringified1);
  assert.ok(ast2);
  const stringified2 = stringifySTL(ast2);

  // Idempotency: formatting twice produces identical output
  assert.equal(stringified1, stringified2);
});

test('STL Extended: Fuzz & Resilience testi (Parser heç vaxt çökməməlidir)', () => {
  const badInputs = [
    '',
    '{}{}{{{}',
    'theme { { { }',
    'theme "a" extends "" { colors { primary: } }',
    '///////*****\\\\\\\\',
    'theme "x" { tokens { { { } } } modes { { } } }',
    '\0\0\0\x01\x02',
    'theme "test" { invalid 123 :: ; }',
  ];

  for (const input of badInputs) {
    assert.doesNotThrow(() => {
      parseSTL(input);
    }, `Parser crashed on: ${input}`);
  }
});
