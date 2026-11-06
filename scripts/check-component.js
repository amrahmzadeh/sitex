const fs = require('fs');
const content = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

console.log('File size:', content.length);
console.log('Lines count:', content.split('\n').length);

// Check if style tag is already in the file
console.log('Has <style tag:', content.includes('<style'));

// Check hero title rendering
const heroMatch = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
if (heroMatch) {
  console.log('H1 content:');
  console.log(heroMatch[0]);
}
