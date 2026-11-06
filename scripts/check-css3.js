const fs = require('fs');
const css = fs.readFileSync('.next/static/css/e59b76ea43f8abb1.css', 'utf8');
console.log('Length:', css.length);
console.log('.hidden:', css.includes('.pizza-house-root .hidden'));
console.log('lg:flex:', css.includes('.pizza-house-root .lg\\:flex'));
console.log('lg:hidden:', css.includes('.pizza-house-root .lg\\:hidden'));
console.log('grid-cols-12:', css.includes('grid-template-columns:repeat(12'));

