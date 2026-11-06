const fs = require('fs');

const html = fs.readFileSync('pro_template/code.html', 'utf8');

// Extract all class attributes
const classRegex = /class="([^"]+)"/g;
let match;
const allClasses = new Set();
while ((match = classRegex.exec(html)) !== null) {
  const parts = match[1].split(/\s+/);
  for (const p of parts) {
    if (p.trim()) allClasses.add(p.trim());
  }
}

console.log('Total unique classes in code.html:', allClasses.size);
const sorted = Array.from(allClasses).sort();
fs.writeFileSync('scripts/code-html-classes.json', JSON.stringify(sorted, null, 2));
console.log('Saved to scripts/code-html-classes.json');

// Group classes
const colorClasses = sorted.filter(c => 
  c.startsWith('bg-') || c.startsWith('text-') || c.startsWith('border-') || 
  c.startsWith('shadow-') || c.startsWith('fill-') || c.includes('hover:bg-') || 
  c.includes('hover:text-')
);
console.log('Color/shadow related classes:', colorClasses.length);
console.log('Sample:', colorClasses.slice(0, 30));
