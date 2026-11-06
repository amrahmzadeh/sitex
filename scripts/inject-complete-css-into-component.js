const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/components/themes/pizza-house-generated.css');
const responsiveScript = require('./add-pizza-house-responsive.js');

// Also read responsive CSS from globals or generate it
const responsiveCSS = `
/* Layout & Responsive utilities scoped to .pizza-house-root */
.pizza-house-root .hidden { display: none !important; }
.pizza-house-root .block { display: block !important; }
.pizza-house-root .inline-block { display: inline-block !important; }
.pizza-house-root .flex { display: flex !important; }
.pizza-house-root .inline-flex { display: inline-flex !important; }
.pizza-house-root .grid { display: grid !important; }
.pizza-house-root .flex-col { flex-direction: column !important; }
.pizza-house-root .flex-wrap { flex-wrap: wrap !important; }
.pizza-house-root .flex-row { flex-direction: row !important; }
.pizza-house-root .items-center { align-items: center !important; }
.pizza-house-root .items-start { align-items: flex-start !important; }
.pizza-house-root .items-end { align-items: flex-end !important; }
.pizza-house-root .justify-center { justify-content: center !important; }
.pizza-house-root .justify-between { justify-content: space-between !important; }
.pizza-house-root .justify-end { justify-content: flex-end !important; }
.pizza-house-root .justify-start { justify-content: flex-start !important; }
.pizza-house-root .w-full { width: 100% !important; }
.pizza-house-root .h-full { height: 100% !important; }
.pizza-house-root .min-h-screen { min-height: 100vh !important; }
.pizza-house-root .w-auto { width: auto !important; }
.pizza-house-root .h-auto { height: auto !important; }
.pizza-house-root .w-8 { width: 2rem !important; }
.pizza-house-root .h-8 { height: 2rem !important; }
.pizza-house-root .w-9 { width: 2.25rem !important; }
.pizza-house-root .h-9 { height: 2.25rem !important; }
.pizza-house-root .w-10 { width: 2.5rem !important; }
.pizza-house-root .h-10 { height: 2.5rem !important; }
.pizza-house-root .w-12 { width: 3rem !important; }
.pizza-house-root .h-12 { height: 3rem !important; }
.pizza-house-root .w-14 { width: 3.5rem !important; }
.pizza-house-root .h-14 { height: 3.5rem !important; }
.pizza-house-root .w-72 { width: 18rem !important; }
.pizza-house-root .h-72 { height: 18rem !important; }
.pizza-house-root .w-96 { width: 24rem !important; }
.pizza-house-root .h-96 { height: 24rem !important; }

.pizza-house-root .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
.pizza-house-root .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
.pizza-house-root .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
.pizza-house-root .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
.pizza-house-root .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }

.pizza-house-root .col-span-1 { grid-column: span 1 / span 1 !important; }
.pizza-house-root .col-span-2 { grid-column: span 2 / span 2 !important; }
.pizza-house-root .col-span-full { grid-column: 1 / -1 !important; }
.pizza-house-root .row-span-2 { grid-row: span 2 / span 2 !important; }

.pizza-house-root .gap-1 { gap: 0.25rem !important; }
.pizza-house-root .gap-1\\.5 { gap: 0.375rem !important; }
.pizza-house-root .gap-2 { gap: 0.5rem !important; }
.pizza-house-root .gap-2\\.5 { gap: 0.625rem !important; }
.pizza-house-root .gap-3 { gap: 0.75rem !important; }
.pizza-house-root .gap-4 { gap: 1rem !important; }
.pizza-house-root .gap-6 { gap: 1.5rem !important; }
.pizza-house-root .gap-8 { gap: 2rem !important; }
.pizza-house-root .gap-12 { gap: 3rem !important; }

.pizza-house-root .space-y-1 > * + * { margin-top: 0.25rem !important; }
.pizza-house-root .space-y-2 > * + * { margin-top: 0.5rem !important; }
.pizza-house-root .space-y-3 > * + * { margin-top: 0.75rem !important; }
.pizza-house-root .space-y-4 > * + * { margin-top: 1rem !important; }
.pizza-house-root .space-y-6 > * + * { margin-top: 1.5rem !important; }
.pizza-house-root .space-y-8 > * + * { margin-top: 2rem !important; }

.pizza-house-root .space-x-2 > * + * { margin-left: 0.5rem !important; }
.pizza-house-root .space-x-3 > * + * { margin-left: 0.75rem !important; }
.pizza-house-root .space-x-4 > * + * { margin-left: 1rem !important; }

/* Responsive Overrides */
@media (min-width: 640px) {
  .pizza-house-root .sm\\:inline { display: inline !important; }
  .pizza-house-root .sm\\:inline-flex { display: inline-flex !important; }
  .pizza-house-root .sm\\:flex { display: flex !important; }
  .pizza-house-root .sm\\:hidden { display: none !important; }
  .pizza-house-root .sm\\:flex-row { flex-direction: row !important; }
  .pizza-house-root .sm\\:w-auto { width: auto !important; }
  .pizza-house-root .sm\\:w-96 { width: 24rem !important; }
  .pizza-house-root .sm\\:h-96 { height: 24rem !important; }
  .pizza-house-root .sm\\:max-w-lg { max-width: 32rem !important; }
  .pizza-house-root .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .pizza-house-root .sm\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .pizza-house-root .sm\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
  .pizza-house-root .sm\\:gap-4 { gap: 1rem !important; }
  .pizza-house-root .sm\\:gap-6 { gap: 1.5rem !important; }
  .pizza-house-root .sm\\:p-8 { padding: 2rem !important; }
  .pizza-house-root .sm\\:text-left { text-align: left !important; }
  .pizza-house-root .sm\\:items-start { align-items: flex-start !important; }
  .pizza-house-root .sm\\:top-4 { top: 1rem !important; }
  .pizza-house-root .sm\\:-left-6 { left: -1.5rem !important; }
  .pizza-house-root .sm\\:-right-6 { right: -1.5rem !important; }
  .pizza-house-root .sm\\:-bottom-4 { bottom: -1rem !important; }
  .pizza-house-root .sm\\:bottom-6 { bottom: 1.5rem !important; }
  .pizza-house-root .sm\\:left-8 { left: 2rem !important; }
  .pizza-house-root .sm\\:-left-4 { left: -1rem !important; }
}

@media (min-width: 768px) {
  .pizza-house-root .md\\:flex { display: flex !important; }
  .pizza-house-root .md\\:hidden { display: none !important; }
  .pizza-house-root .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .pizza-house-root .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .pizza-house-root .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
  .pizza-house-root .md\\:col-span-2 { grid-column: span 2 / span 2 !important; }
  .pizza-house-root .md\\:gap-8 { gap: 2rem !important; }
  .pizza-house-root .md\\:p-8 { padding: 2rem !important; }
  .pizza-house-root .md\\:p-12 { padding: 3rem !important; }
}

@media (min-width: 1024px) {
  .pizza-house-root .lg\\:flex { display: flex !important; }
  .pizza-house-root .lg\\:hidden { display: none !important; }
  .pizza-house-root .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
  .pizza-house-root .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
  .pizza-house-root .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .pizza-house-root .lg\\:col-span-3 { grid-column: span 3 / span 3 !important; }
  .pizza-house-root .lg\\:col-span-4 { grid-column: span 4 / span 4 !important; }
  .pizza-house-root .lg\\:col-span-5 { grid-column: span 5 / span 5 !important; }
  .pizza-house-root .lg\\:col-span-6 { grid-column: span 6 / span 6 !important; }
  .pizza-house-root .lg\\:col-span-7 { grid-column: span 7 / span 7 !important; }
  .pizza-house-root .lg\\:col-span-8 { grid-column: span 8 / span 8 !important; }
  .pizza-house-root .lg\\:gap-8 { gap: 2rem !important; }
  .pizza-house-root .lg\\:gap-12 { gap: 3rem !important; }
  .pizza-house-root .lg\\:px-12 { padding-left: 3rem !important; padding-right: 3rem !important; }
  .pizza-house-root .lg\\:py-28 { padding-top: 7rem !important; padding-bottom: 7rem !important; }
}
`;

const generatedCSS = fs.readFileSync(cssPath, 'utf8');
const fullCombinedCSS = responsiveCSS + '\n' + generatedCSS;

// Read PizzaHouseSite.tsx
const compPath = path.join(__dirname, '../src/components/themes/PizzaHouseSite.tsx');
let comp = fs.readFileSync(compPath, 'utf8');

// Replace the <style> tag content
const styleRegex = /<style>\{`[\s\S]*?`\}<\/style>/;
if (styleRegex.test(comp)) {
  const replacement = `<style dangerouslySetInnerHTML={{ __html: \`${fullCombinedCSS.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\` }} />`;
  comp = comp.replace(styleRegex, replacement);
  console.log('Replaced existing <style> tag with full combined CSS!');
} else {
  console.log('Did not find existing <style> tag pattern!');
}

// Ensure hero H1 rendering supports splitting "Hər Dilimdə"
const oldH1 = `{content.hero?.title || (
                    <>
                      Əsl Pizza Zövqü, <br />
                      <span className="text-[#d7263d]">Hər Dilimdə</span>
                    </>
                  )}`;

const newH1 = `(() => {
                    const raw = content.hero?.title || theme.heroHeadline || 'Əsl Pizza Zövqü, Hər Dilimdə';
                    if (raw.includes('Hər Dilimdə')) {
                      const parts = raw.split('Hər Dilimdə');
                      return (
                        <>
                          {parts[0]}
                          <br className="hidden sm:inline" />
                          <span className="text-[#d7263d] text-primary-container">Hər Dilimdə</span>
                          {parts.slice(1).join('Hər Dilimdə')}
                        </>
                      );
                    }
                    return raw;
                  })()`;

if (comp.includes(oldH1)) {
  comp = comp.replace(oldH1, newH1);
  console.log('Updated H1 title splitting logic!');
}

fs.writeFileSync(compPath, comp, 'utf8');
console.log('Successfully updated PizzaHouseSite.tsx, length:', comp.length);

