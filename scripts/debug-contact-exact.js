const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

const startIdx = comp.indexOf('{/* Ünvan */}');
console.log('Snippet of contact section (before, during, and after):');
console.log(comp.substring(startIdx - 100, startIdx + 1200));

const endIdx = comp.indexOf('{/* Social Media Badges */}', startIdx);
console.log('\nSnippet between cards and Social Media Badges:');
console.log(comp.substring(endIdx - 150, endIdx + 150));
