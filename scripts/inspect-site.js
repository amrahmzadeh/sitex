const fs = require('fs');

async function test() {
  const res = await fetch('https://sitex-onlive.vercel.app/site/pizza-house');
  const html = await res.text();
  fs.writeFileSync('scripts/live-page.html', html, 'utf8');
  console.log('Saved live-page.html, size:', html.length);
  
  const hIdx = html.indexOf('<header');
  if (hIdx !== -1) {
    console.log('Header html:', html.substring(hIdx, hIdx + 400));
  }
  
  const heroIdx = html.indexOf('id="hero"');
  if (heroIdx !== -1) {
    console.log('Hero html:', html.substring(heroIdx, heroIdx + 600));
  }
}
test();
