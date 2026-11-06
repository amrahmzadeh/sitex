const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');
const idx = comp.indexOf('id="rezervasiya"');
console.log(comp.substring(idx - 100, idx + 200));

const btnIdx = comp.indexOf('Rezervasiyanı təsdiqlə');
console.log('\nSubmit button snippet:');
console.log(comp.substring(btnIdx - 200, btnIdx + 100));
