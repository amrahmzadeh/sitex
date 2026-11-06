const fs = require('fs');
const tsx = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

const simpleMatches = tsx.match(/className="([^"]+)"/g) || [];
const tmplMatches = tsx.match(/className={`([^`]+)`}/g) || [];

const allClasses = new Set();
simpleMatches.forEach(m => {
  m.replace('className="', '').replace(/"$/, '').split(/\s+/).forEach(c => allClasses.add(c));
});
tmplMatches.forEach(m => {
  m.replace('className={`', '').replace(/`}$/, '').split(/\s+/).forEach(c => allClasses.add(c));
});

// Get arbitrary value classes (bg-[...], text-[...], etc.)
const arbitraryClasses = [...allClasses].filter(c => c.includes('['));
console.log('Arbitrary classes:');
arbitraryClasses.sort().forEach(c => console.log(c));

// Also check what colors appear
const colorClasses = [...allClasses].filter(c => 
  c.match(/^(bg|text|border|fill|from|to|shadow|ring|outline)-/) && !c.includes('[')
);
console.log('\nNamed color/style classes:');
colorClasses.sort().forEach(c => console.log(c));
