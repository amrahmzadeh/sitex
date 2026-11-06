const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');
const lines = comp.split('\n');
console.log('Lines 1-50:');
console.log(lines.slice(0, 50).join('\n'));
console.log('\nWhere is <style tag?');
lines.forEach((l, idx) => {
  if (l.includes('<style')) console.log(`Line ${idx + 1}: ${l.substring(0, 80)}`);
});

