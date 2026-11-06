const fs = require('fs');
let comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

const target = `<h1 className="font-display-hero text-display-hero text-[#1c1b1b] tracking-tight leading-tight">
                  (() => {`;

const replacement = `<h1 className="font-display-hero text-display-hero text-[#1c1b1b] tracking-tight leading-tight">
                  {(() => {`;

const targetEnd = `return raw;
                  })()
                </h1>`;

const replacementEnd = `return raw;
                  })()}
                </h1>`;

if (comp.includes(target) && comp.includes(targetEnd)) {
  comp = comp.replace(target, replacement);
  comp = comp.replace(targetEnd, replacementEnd);
  fs.writeFileSync('src/components/themes/PizzaHouseSite.tsx', comp, 'utf8');
  console.log('Successfully fixed JSX brackets!');
} else {
  console.error('Target not found!');
}

