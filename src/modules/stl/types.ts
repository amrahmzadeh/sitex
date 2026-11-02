export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'STRING'
  | 'COLOR'
  | 'NUMBER'
  | 'DIMENSION'
  | 'COLON'
  | 'DOT'
  | 'COMMA'
  | 'PERCENT'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACE'
  | 'RBRACE'
  | 'COMMENT'
  | 'EOF'
  | 'UNKNOWN';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  start: number;
  end: number;
}

export interface SourceLocation {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  start?: number;
  end?: number;
}

export interface STLError {
  code?: string;
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface STLProperty {
  type: 'Property';
  key: string;
  value: string;
  valueType: 'string' | 'color' | 'dimension' | 'number' | 'variable' | 'function' | 'raw';
  loc: SourceLocation;
}

export interface STLBlock {
  type: 'Block';
  name: string;
  properties: STLProperty[];
  nestedBlocks: STLBlock[];
  loc: SourceLocation;
}

export interface STLComment {
  type: 'line' | 'block';
  text: string;
  line: number;
  column: number;
}

export interface STLThemeNode {
  type: 'Theme';
  id: string;
  parentTheme?: string;
  imports?: string[];
  meta: Record<string, string>;
  colors: Record<string, string>;
  typography: Record<string, string>;
  layout: Record<string, string>;
  tokens?: Record<string, Record<string, string>>;
  modes?: {
    light?: Record<string, any>;
    dark?: Record<string, any>;
    [mode: string]: any;
  };
  responsive?: {
    tablet?: Record<string, any>;
    mobile?: Record<string, any>;
    [device: string]: any;
  };
  components: Record<string, Record<string, string>>;
  sections?: Array<{
    id: string;
    type: string;
    name?: string;
    props: Record<string, any>;
  }>;
  customBlocks: Record<string, STLBlock>;
  comments?: STLComment[];
  rawAst: STLBlock[];
  loc: SourceLocation;
}

export interface STLCompilationResult {
  success: boolean;
  theme?: STLThemeNode;
  errors: STLError[];
  cssVariables: Record<string, string>;
  compiledCss: string;
  tailwindConfig?: Record<string, any>;
}

export interface STLCompletionItem {
  label: string;
  kind: 'keyword' | 'property' | 'value' | 'variable' | 'component';
  detail: string;
  insertText: string;
  documentation?: string;
}
