const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');
const lines = comp.split('\n');
for (let i = 2175; i < 2195; i++) {
  console.log((i + 1) + ': ' + lines[i]);
}
