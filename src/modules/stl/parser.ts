import {
  Token,
  STLError,
  STLProperty,
  STLBlock,
  STLThemeNode,
  STLComment,
  SourceLocation,
} from './types';
import { tokenizeSTL } from './tokenizer';
import { STL_DIAGNOSTICS, findBestSuggestion } from './diagnostics';

const KNOWN_TOP_BLOCKS = [
  'meta',
  'colors',
  'typography',
  'layout',
  'tokens',
  'modes',
  'responsive',
  'components',
];

const KNOWN_COLOR_FUNCTIONS = new Set(['lighten', 'darken', 'alpha', 'mix']);

export interface ParseSTLOptions {
  fileMap?: Record<string, string>;
  currentFile?: string;
  visitedFiles?: Set<string>;
}

export function parseSTL(
  source: string,
  options?: ParseSTLOptions
): { ast: STLThemeNode | null; errors: STLError[] } {
  const { tokens, errors: tokenErrors } = tokenizeSTL(source);
  const errors: STLError[] = tokenErrors.map((e) => ({
    code: STL_DIAGNOSTICS.SYNTAX_ERROR,
    message: e.message,
    line: e.line,
    column: e.column,
    severity: 'error',
  }));

  let current = 0;

  const peek = (offset = 0): Token => tokens[current + offset] || tokens[tokens.length - 1];
  const isAtEnd = (): boolean => peek().type === 'EOF';

  const advance = (): Token => {
    if (!isAtEnd()) current++;
    return tokens[current - 1];
  };

  const check = (type: string, val?: string): boolean => {
    if (isAtEnd()) return false;
    if (peek().type !== type) return false;
    if (val !== undefined && peek().value.toLowerCase() !== val.toLowerCase()) return false;
    return true;
  };

  const match = (type: string, val?: string): boolean => {
    if (check(type, val)) {
      advance();
      return true;
    }
    return false;
  };

  // Collect comments
  const comments: STLComment[] = [];
  tokens.forEach((t) => {
    if (t.type === 'COMMENT') {
      comments.push({
        type: t.value.includes('\n') ? 'block' : 'line',
        text: t.value,
        line: t.line,
        column: t.column,
      });
    }
  });

  const skipComments = () => {
    while (check('COMMENT')) {
      advance();
    }
  };

  // Synchronize helper for error recovery
  const synchronizeToNextStatement = () => {
    while (!isAtEnd()) {
      if (peek().type === 'RBRACE') return;
      const t = advance();
      if (t.type === 'KEYWORD' || (t.type === 'IDENTIFIER' && peek().type === 'COLON')) {
        current--;
        return;
      }
    }
  };

  // Parse function calls e.g. lighten(colors.primary, 10%)
  const parseFunctionCall = (fnName: string): { value: string; valueType: STLProperty['valueType'] } => {
    advance(); // consume '('
    const args: string[] = [];
    let currentArg = '';

    while (!check('RPAREN') && !isAtEnd()) {
      skipComments();
      if (check('COMMA')) {
        args.push(currentArg.trim());
        currentArg = '';
        advance();
        continue;
      }
      const tok = advance();
      currentArg += tok.value;
    }

    if (currentArg.trim()) {
      args.push(currentArg.trim());
    }

    if (check('RPAREN')) {
      advance();
    } else {
      errors.push({
        code: STL_DIAGNOSTICS.SYNTAX_ERROR,
        message: `'${fnName}' funksiyası üçün ')' bağlanış mötərizəsi gözlənilirdi`,
        line: peek().line,
        column: peek().column,
        severity: 'error',
      });
    }

    return {
      value: `${fnName}(${args.join(', ')})`,
      valueType: 'function',
    };
  };

  // Parse a property value
  const parsePropertyValue = (): { value: string; valueType: STLProperty['valueType'] } => {
    skipComments();
    const token = peek();

    // Check for variable or token wrapper e.g. {tokens.spacing.md}
    if (check('LBRACE')) {
      advance(); // skip {
      skipComments();
      let innerVal = '';
      while (!check('RBRACE') && !isAtEnd()) {
        innerVal += advance().value;
      }
      if (check('RBRACE')) advance();
      return { value: innerVal.trim(), valueType: 'variable' };
    }

    if (match('STRING')) {
      return { value: token.value, valueType: 'string' };
    }

    if (match('COLOR')) {
      return { value: token.value, valueType: 'color' };
    }

    if (match('DIMENSION')) {
      return { value: token.value, valueType: 'dimension' };
    }

    if (match('NUMBER')) {
      return { value: token.value, valueType: 'number' };
    }

    if (check('IDENTIFIER') || check('KEYWORD')) {
      const first = advance();

      // Check function call: lighten(...)
      if (check('LPAREN')) {
        return parseFunctionCall(first.value);
      }

      // Check variable dot notation: e.g. colors.primary or tokens.spacing.md
      if (check('DOT')) {
        let fullPath = first.value;
        while (match('DOT')) {
          skipComments();
          if (check('IDENTIFIER') || check('KEYWORD')) {
            const nextPart = advance();
            fullPath += `.${nextPart.value}`;
          } else {
            errors.push({
              code: STL_DIAGNOSTICS.SYNTAX_ERROR,
              message: "Nöqtədən sonra identifikator tələb olunur (məsələn: 'colors.primary')",
              line: peek().line,
              column: peek().column,
              severity: 'error',
            });
            break;
          }
        }
        return { value: fullPath, valueType: 'variable' };
      }

      return { value: first.value, valueType: 'raw' };
    }

    const t = advance();
    return { value: t.value || '', valueType: 'raw' };
  };

  // Parse a generic Block
  const parseBlock = (): STLBlock | null => {
    skipComments();
    if (!check('IDENTIFIER') && !check('KEYWORD') && !check('STRING')) {
      return null;
    }

    const nameToken = advance();
    const blockName = nameToken.value;

    skipComments();
    if (!match('LBRACE')) {
      errors.push({
        code: STL_DIAGNOSTICS.MISSING_BRACE,
        message: `'${blockName}' blokundan sonra '{' gözlənilirdi`,
        line: nameToken.line,
        column: nameToken.column,
        severity: 'error',
      });
      return null;
    }

    const properties: STLProperty[] = [];
    const nestedBlocks: STLBlock[] = [];

    while (!check('RBRACE') && !isAtEnd()) {
      skipComments();
      if (check('RBRACE') || isAtEnd()) break;

      const propKeyToken = peek();
      if (!check('IDENTIFIER') && !check('KEYWORD') && !check('STRING')) {
        errors.push({
          code: STL_DIAGNOSTICS.SYNTAX_ERROR,
          message: `Gözlənilməz ifadə '${propKeyToken.value}'`,
          line: propKeyToken.line,
          column: propKeyToken.column,
          severity: 'error',
        });
        advance();
        continue;
      }

      const nextToken = peek(1);
      if (nextToken.type === 'LBRACE') {
        const nested = parseBlock();
        if (nested) nestedBlocks.push(nested);
        continue;
      }

      const keyToken = advance();
      if (!match('COLON')) {
        if (check('LBRACE')) {
          advance();
          continue;
        }
        errors.push({
          code: STL_DIAGNOSTICS.MISSING_COLON,
          message: `'${keyToken.value}' xassəsindən sonra ':' gözlənilirdi`,
          line: keyToken.line,
          column: keyToken.column,
          severity: 'error',
        });
        synchronizeToNextStatement();
        continue;
      }

      const { value, valueType } = parsePropertyValue();
      properties.push({
        type: 'Property',
        key: keyToken.value,
        value,
        valueType,
        loc: {
          line: keyToken.line,
          column: keyToken.column,
          endLine: peek().line,
          endColumn: peek().column,
        },
      });
    }

    const endToken = peek();
    if (match('RBRACE')) {
      // closed cleanly
    } else {
      errors.push({
        code: STL_DIAGNOSTICS.MISSING_BRACE,
        message: `'${blockName}' bloku üçün '}' bağlanış mötərizəsi gözlənilirdi`,
        line: endToken.line,
        column: endToken.column,
        severity: 'error',
      });
    }

    return {
      type: 'Block',
      name: blockName,
      properties,
      nestedBlocks,
      loc: {
        line: nameToken.line,
        column: nameToken.column,
        endLine: endToken.line,
        endColumn: endToken.column,
      },
    };
  };

  skipComments();

  // Handle top-level imports: import "colors.stl"
  const imports: string[] = [];
  while (match('KEYWORD', 'import')) {
    skipComments();
    if (check('STRING')) {
      const impPath = advance().value;
      imports.push(impPath);
    } else {
      errors.push({
        code: STL_DIAGNOSTICS.SYNTAX_ERROR,
        message: "'import' direktivindən sonra fayl adı string formatında gözlənilirdi",
        line: peek().line,
        column: peek().column,
        severity: 'error',
      });
    }
    skipComments();
  }

  // Circular import check if fileMap provided
  if (options?.fileMap && options.currentFile) {
    const visited = options.visitedFiles || new Set<string>();
    visited.add(options.currentFile);

    for (const imp of imports) {
      if (visited.has(imp)) {
        errors.push({
          code: STL_DIAGNOSTICS.CIRCULAR_DEPENDENCY,
          message: `Dövri asılılıq aşkar edildi: '${options.currentFile}' -> '${imp}'`,
          line: 1,
          column: 1,
          severity: 'error',
        });
      }
    }
  }

  if (isAtEnd()) {
    return {
      ast: null,
      errors: [
        {
          code: STL_DIAGNOSTICS.SYNTAX_ERROR,
          message: 'STL kodu boşdur',
          line: 1,
          column: 1,
          severity: 'warning',
        },
      ],
    };
  }

  // Expect 'theme' keyword
  if (!match('KEYWORD', 'theme')) {
    const candidate = peek().value;
    const suggestion = findBestSuggestion(candidate, ['theme', 'import']);
    errors.push({
      code: STL_DIAGNOSTICS.SYNTAX_ERROR,
      message: `STL kodu 'theme' açar sözü ilə başlamalıdır (məsələn: theme "MyTheme" { ... })`,
      suggestion: suggestion ? `Bunu demək istəyirdiniz: '${suggestion}'?` : undefined,
      line: peek().line,
      column: peek().column,
      severity: 'error',
    });
    return { ast: null, errors };
  }

  skipComments();
  let themeId = 'CustomTheme';
  if (check('STRING') || check('IDENTIFIER')) {
    themeId = advance().value;
  } else {
    errors.push({
      code: STL_DIAGNOSTICS.SYNTAX_ERROR,
      message: 'Tema adı tələb olunur (məsələn: theme "MyTheme")',
      line: peek().line,
      column: peek().column,
      severity: 'error',
    });
  }

  let parentTheme: string | undefined = undefined;
  skipComments();
  if (match('KEYWORD', 'extends')) {
    skipComments();
    if (check('STRING') || check('IDENTIFIER')) {
      parentTheme = advance().value;
    } else {
      errors.push({
        code: STL_DIAGNOSTICS.SYNTAX_ERROR,
        message: "'extends' açar sözündən sonra ana tema adı göstərilməlidir",
        line: peek().line,
        column: peek().column,
        severity: 'error',
      });
    }
  }

  skipComments();
  if (!match('LBRACE')) {
    errors.push({
      code: STL_DIAGNOSTICS.MISSING_BRACE,
      message: "Tema başlığından sonra '{' açılış mötərizəsi gözlənilirdi",
      line: peek().line,
      column: peek().column,
      severity: 'error',
    });
    return { ast: null, errors };
  }

  const meta: Record<string, string> = {};
  const colors: Record<string, string> = {};
  const typography: Record<string, string> = {};
  const layout: Record<string, string> = {};
  const tokensMap: Record<string, Record<string, string>> = {};
  const modesMap: Record<string, any> = {};
  const responsiveMap: Record<string, any> = {};
  const components: Record<string, Record<string, string>> = {};
  const customBlocks: Record<string, STLBlock> = {};
  const rawAst: STLBlock[] = [];

  while (!check('RBRACE') && !isAtEnd()) {
    skipComments();
    if (check('RBRACE') || isAtEnd()) break;

    const block = parseBlock();
    if (!block) {
      advance();
      continue;
    }

    rawAst.push(block);
    const lowerName = block.name.toLowerCase();

    // Check unknown block suggestion
    if (!KNOWN_TOP_BLOCKS.includes(lowerName)) {
      const sug = findBestSuggestion(lowerName, KNOWN_TOP_BLOCKS);
      if (sug) {
        errors.push({
          code: STL_DIAGNOSTICS.UNKNOWN_KEY,
          message: `'${block.name}' adlı standart blok mövcud deyil. Xüsusi blok kimi qəbul edildi.`,
          suggestion: `Bunu demək istəyirdiniz: '${sug}'?`,
          line: block.loc.line,
          column: block.loc.column,
          severity: 'info',
        });
      }
    }

    if (lowerName === 'meta') {
      block.properties.forEach((p) => {
        meta[p.key] = p.value;
      });
    } else if (lowerName === 'colors') {
      block.properties.forEach((p) => {
        colors[p.key] = p.value;
      });
    } else if (lowerName === 'typography') {
      block.properties.forEach((p) => {
        typography[p.key] = p.value;
      });
    } else if (lowerName === 'layout') {
      block.properties.forEach((p) => {
        layout[p.key] = p.value;
      });
    } else if (lowerName === 'tokens') {
      // Tokens block can contain nested category blocks or direct properties
      block.properties.forEach((p) => {
        if (!tokensMap.general) tokensMap.general = {};
        tokensMap.general[p.key] = p.value;
      });
      block.nestedBlocks.forEach((nb) => {
        const catProps: Record<string, string> = {};
        nb.properties.forEach((p) => {
          catProps[p.key] = p.value;
        });
        tokensMap[nb.name] = catProps;
      });
    } else if (lowerName === 'modes') {
      // modes { light { ... } dark { ... } }
      block.nestedBlocks.forEach((nb) => {
        const modeData: Record<string, any> = {};
        nb.properties.forEach((p) => {
          modeData[p.key] = p.value;
        });
        nb.nestedBlocks.forEach((subBlock) => {
          const subProps: Record<string, string> = {};
          subBlock.properties.forEach((p) => {
            subProps[p.key] = p.value;
          });
          modeData[subBlock.name] = subProps;
        });
        modesMap[nb.name] = modeData;
      });
    } else if (lowerName === 'responsive') {
      // responsive { tablet { ... } mobile { ... } }
      block.nestedBlocks.forEach((nb) => {
        const respData: Record<string, any> = {};
        nb.properties.forEach((p) => {
          respData[p.key] = p.value;
        });
        nb.nestedBlocks.forEach((subBlock) => {
          const subProps: Record<string, string> = {};
          subBlock.properties.forEach((p) => {
            subProps[p.key] = p.value;
          });
          respData[subBlock.name] = subProps;
        });
        responsiveMap[nb.name] = respData;
      });
    } else if (lowerName === 'components') {
      block.nestedBlocks.forEach((nb) => {
        const compProps: Record<string, string> = {};
        nb.properties.forEach((p) => {
          compProps[p.key] = p.value;
        });
        components[nb.name] = compProps;
      });
    } else {
      customBlocks[block.name] = block;
    }
  }

  const themeEndToken = peek();
  if (!match('RBRACE')) {
    errors.push({
      code: STL_DIAGNOSTICS.MISSING_BRACE,
      message: "Tema üçün '}' bağlanış mötərizəsi gözlənilirdi",
      line: themeEndToken.line,
      column: themeEndToken.column,
      severity: 'error',
    });
  }

  const ast: STLThemeNode = {
    type: 'Theme',
    id: themeId,
    parentTheme,
    imports: imports.length > 0 ? imports : undefined,
    meta: {
      name: meta.name || themeId,
      version: meta.version || '1.0.0',
      author: meta.author || 'SiteX',
      description: meta.description || 'SiteX Theme Language ilə yaradılmış tema',
      ...meta,
    },
    colors,
    typography,
    layout,
    tokens: Object.keys(tokensMap).length > 0 ? tokensMap : undefined,
    modes: Object.keys(modesMap).length > 0 ? modesMap : undefined,
    responsive: Object.keys(responsiveMap).length > 0 ? responsiveMap : undefined,
    components,
    customBlocks,
    comments: comments.length > 0 ? comments : undefined,
    rawAst,
    loc: {
      line: 1,
      column: 1,
      endLine: themeEndToken.line,
      endColumn: themeEndToken.column,
    },
  };

  return { ast, errors };
}
