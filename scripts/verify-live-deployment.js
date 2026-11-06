async function test() {
  const res = await fetch('https://sitex-onlive.vercel.app/site/pizza-house');
  const html = await res.text();
  console.log('Status:', res.status);
  console.log('HTML size:', html.length);
  
  const hasStyleTag = html.includes('pizza-house-root') && html.includes('bg-primary-container');
  console.log('Has embedded pizza-house style with bg-primary-container:', hasStyleTag);
  
  const hasRedSpan = html.includes('text-[#d7263d]') && html.includes('Hər Dilimdə');
  console.log('Has red span on Hər Dilimdə:', hasRedSpan);

  const heroIdx = html.indexOf('id="hero"');
  if (heroIdx !== -1) {
    console.log('Hero snippet:', html.substring(heroIdx, heroIdx + 500));
  }
}
test();

