import { Token, STLError, STLProperty, STLBlock, STLThemeNode } from './types';
import { tokenizeSTL } from './tokenizer';

export function parseSTL(source: string): { ast: STLThemeNode | null; errors: STLError[] } {
  const { tokens, errors: tokenErrors } = tokenizeSTL(source);
  const errors: STLError[] = tokenErrors.map((e) => ({
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

  const consume = (type: string, errorMsg: string, val?: string): Token => {
    if (check(type, val)) return advance();
    const token = peek();
    errors.push({
      message: `${errorMsg} (alındı: '${token.value || token.type}')`,
      line: token.line,
      column: token.column,
      severity: 'error',
    });
    return token;
  };

  // Skip comments
  const skipComments = () => {
    while (check('COMMENT')) {
      advance();
    }
  };

  // Parse a property value: string, color, dimension, number, variable (e.g. colors.primary)
  const parsePropertyValue = (): { value: string; valueType: STLProperty['valueType'] } => {
    skipComments();
    const token = peek();

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
      // check if it's variable dot notation, e.g. colors.primary
      if (match('DOT')) {
        const second = consume('IDENTIFIER', 'Dəyişən adının ikinci hissəsi tələb olunur');
        return { value: `${first.value}.${second.value}`, valueType: 'variable' };
      }
      return { value: first.value, valueType: 'raw' };
    }

    // fallback
    const t = advance();
    return { value: t.value, valueType: 'raw' };
  };

  // Parse a generic Block: name { prop: val; nested { ... } }
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
          message: `Gözlənilməz ifadə '${propKeyToken.value}'`,
          line: propKeyToken.line,
          column: propKeyToken.column,
          severity: 'error',
        });
        advance();
        continue;
      }

      // Check if this is a nested block or property
      // Lookahead: name { ... } is a block, name: value is property
      const nextToken = peek(1);
      if (nextToken.type === 'LBRACE') {
        const nested = parseBlock();
        if (nested) nestedBlocks.push(nested);
        continue;
      }

      // Property: key: value
      const keyToken = advance();
      if (!match('COLON')) {
        // Maybe user wrote a block with string name or missing colon
        if (check('LBRACE')) {
          advance(); // skip {
          // treat as block
          continue;
        }
        errors.push({
          message: `'${keyToken.value}' xassəsindən sonra ':' gözlənilirdi`,
          line: keyToken.line,
          column: keyToken.column,
          severity: 'error',
        });
        continue;
      }

      const { value, valueType } = parsePropertyValue();
      properties.push({
        type: 'Property',
        key: keyToken.value,
        value,
        valueType,
        loc: { line: keyToken.line, column: keyToken.column },
      });
    }

    consume('RBRACE', `'${blockName}' bloku üçün '}' bağlanış mötərizəsi gözlənilirdi`);

    return {
      type: 'Block',
      name: blockName,
      properties,
      nestedBlocks,
      loc: { line: nameToken.line, column: nameToken.column },
    };
  };

  // Main parser loop: theme "ThemeName" [extends "Parent"] { ... }
  skipComments();

  if (isAtEnd()) {
    return {
      ast: null,
      errors: [{ message: 'STL kodu boşdur', line: 1, column: 1, severity: 'warning' }],
    };
  }

  // Expect 'theme' keyword
  if (!match('KEYWORD', 'theme')) {
    errors.push({
      message: "STL kodu 'theme' açar sözü ilə başlamalıdır (məsələn: theme \"MyTheme\" { ... })",
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

  consume('RBRACE', "Tema üçün '}' bağlanış mötərizəsi gözlənilirdi");

  const ast: STLThemeNode = {
    type: 'Theme',
    id: themeId,
    parentTheme,
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
    components,
    customBlocks,
    rawAst,
    loc: { line: 1, column: 1 },
  };

  return { ast, errors };
}
