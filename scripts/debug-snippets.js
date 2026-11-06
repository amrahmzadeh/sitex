const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

const navIdx = comp.indexOf('navItems.map');
console.log('navItems.map snippet:');
console.log(comp.substring(navIdx - 20, navIdx + 500));

const contactIdx = comp.indexOf('{/* Ünvan */}');
console.log('\nContact snippet:');
console.log(comp.substring(contactIdx - 50, contactIdx + 600));
