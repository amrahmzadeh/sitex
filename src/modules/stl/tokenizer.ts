import { Token, TokenType } from './types';

const KEYWORDS = new Set([
  'theme',
  'extends',
  'import',
  'meta',
  'colors',
  'typography',
  'layout',
  'tokens',
  'modes',
  'responsive',
  'components',
  'section',
]);

export function tokenizeSTL(input: string): {
  tokens: Token[];
  errors: Array<{ message: string; line: number; column: number }>;
} {
  const tokens: Token[] = [];
  const errors: Array<{ message: string; line: number; column: number }> = [];

  let pos = 0;
  let line = 1;
  let col = 1;

  const peek = (offset = 0) => input[pos + offset] || '';

  const advance = () => {
    const ch = input[pos++];
    if (ch === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  };

  while (pos < input.length) {
    const startPos = pos;
    const startLine = line;
    const startCol = col;
    const ch = peek();

    // Skip whitespace
    if (/\s/.test(ch)) {
      advance();
      continue;
    }

    // Comments // or /* */
    if (ch === '/' && peek(1) === '/') {
      advance();
      advance();
      let commentVal = '';
      while (pos < input.length && peek() !== '\n') {
        commentVal += advance();
      }
      tokens.push({
        type: 'COMMENT',
        value: commentVal.trim(),
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === '/' && peek(1) === '*') {
      advance();
      advance();
      let commentVal = '';
      let closed = false;
      while (pos < input.length) {
        if (peek() === '*' && peek(1) === '/') {
          advance();
          advance();
          closed = true;
          break;
        }
        commentVal += advance();
      }
      if (!closed) {
        errors.push({
          message: 'Bağlanmamış şərh bloku (unclosed comment /* ... */)',
          line: startLine,
          column: startCol,
        });
      }
      tokens.push({
        type: 'COMMENT',
        value: commentVal.trim(),
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    // Punctuation
    if (ch === '{') {
      advance();
      tokens.push({
        type: 'LBRACE',
        value: '{',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === '}') {
      advance();
      tokens.push({
        type: 'RBRACE',
        value: '}',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === '(') {
      advance();
      tokens.push({
        type: 'LPAREN',
        value: '(',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === ')') {
      advance();
      tokens.push({
        type: 'RPAREN',
        value: ')',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === ',') {
      advance();
      tokens.push({
        type: 'COMMA',
        value: ',',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === ':') {
      advance();
      tokens.push({
        type: 'COLON',
        value: ':',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === '.') {
      advance();
      tokens.push({
        type: 'DOT',
        value: '.',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    if (ch === '%') {
      advance();
      tokens.push({
        type: 'PERCENT',
        value: '%',
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    // Strings "..." or '...'
    if (ch === '"' || ch === "'") {
      const quote = advance();
      let strVal = '';
      let escaped = false;
      let closed = false;

      while (pos < input.length) {
        const c = advance();
        if (escaped) {
          strVal += c;
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === quote) {
          closed = true;
          break;
        } else {
          strVal += c;
        }
      }

      if (!closed) {
        errors.push({
          message: `Bağlanmamış mətn (unclosed string ${quote})`,
          line: startLine,
          column: startCol,
        });
      }

      tokens.push({
        type: 'STRING',
        value: strVal,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    // Hex Color #...
    if (ch === '#') {
      let colorVal = advance();
      while (pos < input.length && /[0-9a-fA-F]/.test(peek())) {
        colorVal += advance();
      }
      tokens.push({
        type: 'COLOR',
        value: colorVal,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    // Numbers & Dimensions (e.g. 16px, 1.5rem, 85vh, 100%, 0.45)
    if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(peek(1)))) {
      let numVal = advance();
      while (pos < input.length && /[0-9.]/.test(peek())) {
        numVal += advance();
      }
      // Check unit (px, rem, em, vh, vw, %, s, ms)
      let unit = '';
      while (pos < input.length && /[a-zA-Z%]/.test(peek())) {
        unit += advance();
      }

      tokens.push({
        type: unit ? 'DIMENSION' : 'NUMBER',
        value: numVal + unit,
        line: startLine,
        column: startCol,
        endLine: line,
        endColumn: col,
        start: startPos,
        end: pos,
      });
      continue;
    }

    // Identifiers or Keywords (letters, digits, underscores, dashes)
    if (/[a-zA-Z_]/.test(ch)) {
      let idVal = advance();
      while (pos < input.length && /[a-zA-Z0-9_\-]/.test(peek())) {
        idVal += advance();
      }

      const lower = idVal.toLowerCase();
      if (KEYWORDS.has(lower)) {
        tokens.push({
          type: 'KEYWORD',
          value: lower,
          line: startLine,
          column: startCol,
          endLine: line,
          endColumn: col,
          start: startPos,
          end: pos,
        });
      } else {
        tokens.push({
          type: 'IDENTIFIER',
          value: idVal,
          line: startLine,
          column: startCol,
          endLine: line,
          endColumn: col,
          start: startPos,
          end: pos,
        });
      }
      continue;
    }

    // Unknown character
    const unknownChar = advance();
    errors.push({
      message: `Tanınmayan simvol: '${unknownChar}'`,
      line: startLine,
      column: startCol,
    });
    tokens.push({
      type: 'UNKNOWN',
      value: unknownChar,
      line: startLine,
      column: startCol,
      endLine: line,
      endColumn: col,
      start: startPos,
      end: pos,
    });
  }

  tokens.push({
    type: 'EOF',
    value: '',
    line,
    column: col,
    endLine: line,
    endColumn: col,
    start: pos,
    end: pos,
  });

  return { tokens, errors };
}
