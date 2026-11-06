const fs = require('fs');
const css = fs.readFileSync('.next/static/css/362485de4bb61234.css', 'utf8');
console.log('Length:', css.length);
console.log('.hidden:', css.includes('.hidden'));
console.log('display:flex:', css.includes('display:flex'));
// Show part with lg:
const lgIdx = css.indexOf('lg');
console.log('lg exists:', lgIdx !== -1);
// Look for flex
const flexIdx = css.indexOf('flex');
console.log('flex idx:', flexIdx, css.substring(flexIdx, flexIdx + 100));

