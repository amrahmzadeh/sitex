const fs = require('fs');
const tsx = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

// Extract all className values
const classMatches = [...tsx.matchAll(/className[=:{`][\s\S]*?["}`]/g)];
const allClasses = new Set();

// Simple regex to get class strings
const simpleMatches = tsx.match(/className="([^"]+)"/g) || [];
simpleMatches.forEach(m => {
  const inner = m.replace('className="', '').replace('"', '');
  inner.split(/\s+/).forEach(c => allClasses.add(c));
});

// Also get template literal classes
const tmplMatches = tsx.match(/className={`([^`]+)`}/g) || [];
tmplMatches.forEach(m => {
  const inner = m.replace('className={`', '').replace('`}', '');
  inner.split(/\s+/).forEach(c => allClasses.add(c));
});

const responsive = [...allClasses].filter(c => 
  c.match(/^(hidden|lg:|md:|sm:|xl:|block|inline-flex|flex|grid)/)
).sort();

console.log('Responsive/hidden classes:');
console.log(responsive.join('\n'));
console.log('\nTotal unique classes:', allClasses.size);
