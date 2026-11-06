const fs = require('fs');

const html = fs.readFileSync('pro_template/code.html', 'utf8');
const cfgMatch = html.match(/tailwind\.config=({[\s\S]*?});<\/script>/);
const evalObj = eval('(' + cfgMatch[1] + ')');
const colors = evalObj.theme.extend.colors;
const spacing = evalObj.theme.extend.spacing;
const fontSizes = evalObj.theme.extend.fontSize;

let css = '\n\n/* ==================== PIZZA HOUSE PRO TEMPLATE STYLES ==================== */\n';
css += '@import url("https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap");\n';
css += '@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap");\n\n';

css += '.pizza-house-root {\n';
css += '  font-family: "Inter", sans-serif !important;\n';
for (const [k, v] of Object.entries(colors)) {
  css += '  --' + k + ': ' + v + ';\n';
}
for (const [k, v] of Object.entries(spacing)) {
  css += '  --spacing-' + k + ': ' + v + ';\n';
}
css += '}\n\n';

css += '.pizza-house-root .material-symbols-outlined {\n';
css += '  font-family: "Material Symbols Outlined" !important;\n';
css += '  font-weight: normal;\n';
css += '  font-style: normal;\n';
css += '  font-size: 24px;\n';
css += '  line-height: 1;\n';
css += '  letter-spacing: normal;\n';
css += '  text-transform: none;\n';
css += '  display: inline-block;\n';
css += '  white-space: nowrap;\n';
css += '  word-wrap: normal;\n';
css += '  direction: ltr;\n';
css += '  -webkit-font-smoothing: antialiased;\n';
css += '}\n\n';

for (const [k, v] of Object.entries(colors)) {
  css += '.pizza-house-root .bg-' + k + ', .pizza-house-root.bg-' + k + ' { background-color: var(--' + k + ') !important; }\n';
  css += '.pizza-house-root .text-' + k + ' { color: var(--' + k + ') !important; }\n';
  css += '.pizza-house-root .border-' + k + ' { border-color: var(--' + k + ') !important; }\n';
  css += '.pizza-house-root .hover\\:bg-' + k + ':hover { background-color: var(--' + k + ') !important; }\n';
  css += '.pizza-house-root .hover\\:text-' + k + ':hover { color: var(--' + k + ') !important; }\n';
}
for (const [k, v] of Object.entries(spacing)) {
  css += '.pizza-house-root .gap-' + k + ' { gap: var(--spacing-' + k + ') !important; }\n';
  css += '.pizza-house-root .p-' + k + ' { padding: var(--spacing-' + k + ') !important; }\n';
  css += '.pizza-house-root .px-' + k + ' { padding-left: var(--spacing-' + k + ') !important; padding-right: var(--spacing-' + k + ') !important; }\n';
  css += '.pizza-house-root .py-' + k + ' { padding-top: var(--spacing-' + k + ') !important; padding-bottom: var(--spacing-' + k + ') !important; }\n';
  css += '.pizza-house-root .m-' + k + ' { margin: var(--spacing-' + k + ') !important; }\n';
  css += '.pizza-house-root .mx-' + k + ' { margin-left: var(--spacing-' + k + ') !important; margin-right: var(--spacing-' + k + ') !important; }\n';
  css += '.pizza-house-root .my-' + k + ' { margin-top: var(--spacing-' + k + ') !important; margin-bottom: var(--spacing-' + k + ') !important; }\n';
}
for (const [k, v] of Object.entries(fontSizes)) {
  const [size, details] = v;
  css += '.pizza-house-root .font-' + k + ' { font-family: ' + (k.startsWith('headline') || k.startsWith('display') ? '"Epilogue", sans-serif' : '"Inter", sans-serif') + ' !important; font-size: ' + size + ' !important; line-height: ' + details.lineHeight + ' !important; font-weight: ' + details.fontWeight + ' !important;' + (details.letterSpacing ? ' letter-spacing: ' + details.letterSpacing + ' !important;' : '') + ' }\n';
}

const globalsPath = 'src/app/globals.css';
let content = fs.readFileSync(globalsPath, 'utf8');
if (content.includes('PIZZA HOUSE PRO TEMPLATE STYLES')) {
  content = content.replace(/\/\* ==================== PIZZA HOUSE PRO TEMPLATE STYLES ==================== \*\/[\s\S]*/, css.trim());
} else {
  content += '\n' + css;
}
fs.writeFileSync(globalsPath, content);
console.log('Successfully updated src/app/globals.css with Pizza House classes!');
