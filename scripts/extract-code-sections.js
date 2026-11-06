const fs = require('fs');
const html = fs.readFileSync('pro_template/code.html', 'utf8');

function getSection(startStr, endStr) {
  const start = html.indexOf(startStr);
  if (start === -1) return 'NOT FOUND: ' + startStr;
  const end = html.indexOf(endStr, start);
  if (end === -1) return html.substring(start, start + 3000);
  return html.substring(start, end);
}

fs.writeFileSync('scripts/section-header.html', getSection('<header', '</header>'));
fs.writeFileSync('scripts/section-hero.html', getSection('<!-- 1. HERO SECTION', '<!-- 2.'));
fs.writeFileSync('scripts/section-rezervasiya.html', getSection('id="rezervasiya"', '</section>'));
fs.writeFileSync('scripts/section-elaqe.html', getSection('id="elaqe"', '</section>'));
fs.writeFileSync('scripts/section-footer.html', getSection('<footer', '</footer>'));

console.log('Extracted all sections from code.html!');

