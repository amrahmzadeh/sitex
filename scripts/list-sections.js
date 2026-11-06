const fs = require('fs');
const html = fs.readFileSync('pro_template/code.html', 'utf8');

// Find all <section> tags
const secRegex = /<section[^>]*id="([^"]+)"[^>]*>/g;
let m;
while ((m = secRegex.exec(html)) !== null) {
  console.log('Section id:', m[1], 'at pos', m.index);
}

