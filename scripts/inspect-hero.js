const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');
const heroIdx = comp.indexOf('id="hero"');
console.log(comp.substring(heroIdx, heroIdx + 2000));
