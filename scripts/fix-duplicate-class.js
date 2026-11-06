const fs = require('fs');
let comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

const target = `<section className="py-16 lg:py-24 px-6 lg:px-12 bg-[#fcf9f8]" id="elaqe"
            className="py-20 lg:py-28 px-6 lg:px-12"
            style={{ backgroundColor: '#fcf9f8' }}
          >`;

const replacement = `<section
            id="elaqe"
            className="py-20 lg:py-28 px-6 lg:px-12"
            style={{ backgroundColor: '#fcf9f8' }}
          >`;

if (comp.includes(target)) {
  comp = comp.replace(target, replacement);
  fs.writeFileSync('src/components/themes/PizzaHouseSite.tsx', comp, 'utf8');
  console.log('Fixed duplicate className on section elaqe!');
} else {
  console.error('Target not found!');
}

