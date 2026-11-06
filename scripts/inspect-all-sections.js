const fs = require('fs');
const comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

function inspectSection(name, searchStr, len = 1500) {
  const idx = comp.indexOf(searchStr);
  console.log(`\n=== SECTION: ${name} === (index: ${idx})`);
  if (idx !== -1) {
    console.log(comp.substring(idx, idx + len));
  } else {
    console.log('NOT FOUND!');
  }
}

inspectSection('Header', '<header');
inspectSection('Hero CTA', 'CTA Buttons');
inspectSection('Reservation', 'id="rezervasiya"');
inspectSection('Contact', 'id="elaqe"');
inspectSection('Footer', '<footer');

