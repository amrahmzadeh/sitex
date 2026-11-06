const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

const startIdx = comp.indexOf('id="elaqe"');
const endIdx = comp.indexOf('<footer', startIdx);
console.log('Complete Contact section:');
console.log(comp.substring(startIdx, endIdx));
