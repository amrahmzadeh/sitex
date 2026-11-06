async function run() {
  const res = await fetch('https://sitex-onlive.vercel.app/site/pizza-house');
  const text = await res.text();
  console.log('CSS links:', text.match(/href="[^"]+\.css[^"]*"/g));
  
  // Check if flex is in CSS or if tailwind styles were loaded
  const cssUrls = (text.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/g) || []).map(s => s.replace('href="', '').replace('"', ''));
  console.log('Detected CSS URLs:', cssUrls);

  for (const url of cssUrls) {
    const cssRes = await fetch('https://sitex-onlive.vercel.app' + url);
    const cssText = await cssRes.text();
    console.log('CSS URL:', url, 'Length:', cssText.length, 'Contains .hidden:', cssText.includes('.hidden'), 'Contains .flex:', cssText.includes('.flex'), 'Contains display:flex:', cssText.includes('display:flex') || cssText.includes('display: flex'));
  }
}
run();

