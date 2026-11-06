const fs = require('fs');
const css = fs.readFileSync('.next/static/css/c0b51bc7d0c98a5a.css', 'utf8');
console.log('Length:', css.length);
console.log('.hidden:', css.includes('.hidden'));
console.log('.flex:', css.includes('display:flex'));
console.log('lg\\:flex:', css.includes('lg\\:flex'));
// Show first 500 chars
console.log(css.substring(0, 300));

