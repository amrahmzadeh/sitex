const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');
const idx = comp.indexOf('Visual Pizza Showcase');
console.log(comp.substring(idx, idx + 2500));
