export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'STRING'
  | 'COLOR'
  | 'NUMBER'
  | 'DIMENSION'
  | 'COLON'
  | 'DOT'
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
  start: number;
  end: number;
}

export interface SourceLocation {
  line: number;
  column: number;
}

export interface STLError {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
}

export interface STLProperty {
  type: 'Property';
  key: string;
  value: string;
  valueType: 'string' | 'color' | 'dimension' | 'number' | 'variable' | 'raw';
  loc: SourceLocation;
}

export interface STLBlock {
  type: 'Block';
  name: string;
  properties: STLProperty[];
  nestedBlocks: STLBlock[];
  loc: SourceLocation;
}

export interface STLThemeNode {
  type: 'Theme';
  id: string;
  parentTheme?: string;
  meta: Record<string, string>;
  colors: Record<string, string>;
  typography: Record<string, string>;
  layout: Record<string, string>;
  components: Record<string, Record<string, string>>;
  sections?: Array<{
    id: string;
    type: string;
    name?: string;
    props: Record<string, any>;
  }>;
  customBlocks: Record<string, STLBlock>;
  rawAst: STLBlock[];
  loc: SourceLocation;
}

export interface STLCompilationResult {
  success: boolean;
  theme?: STLThemeNode;
  errors: STLError[];
  cssVariables: Record<string, string>;
  compiledCss: string;
}

export interface STLCompletionItem {
  label: string;
  kind: 'keyword' | 'property' | 'value' | 'variable' | 'component';
  detail: string;
  insertText: string;
}
