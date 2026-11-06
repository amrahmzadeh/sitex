const fs = require('fs');

// Pizza House template scoped CSS for Tailwind v4 missing utilities
const pizzaHouseUtilCSS = `

/* ==================== PIZZA HOUSE: RESPONSIVE UTILITIES (Tailwind v4 Safelist) ==================== */
/* Scoped under .pizza-house-root to avoid conflicts with dashboard styles */

/* Layout utilities */
.pizza-house-root .hidden { display: none !important; }
.pizza-house-root .block { display: block !important; }
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
.pizza-house-root .h-20 { height: 5rem !important; }
.pizza-house-root .w-96 { width: 24rem !important; }
.pizza-house-root .h-96 { height: 24rem !important; }

/* Grid columns */
.pizza-house-root .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
.pizza-house-root .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
.pizza-house-root .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
.pizza-house-root .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }

/* Col span */
.pizza-house-root .col-span-1 { grid-column: span 1 / span 1 !important; }
.pizza-house-root .col-span-2 { grid-column: span 2 / span 2 !important; }
.pizza-house-root .col-span-3 { grid-column: span 3 / span 3 !important; }
.pizza-house-root .col-span-6 { grid-column: span 6 / span 6 !important; }
.pizza-house-root .col-span-12 { grid-column: span 12 / span 12 !important; }

/* Position */
.pizza-house-root .fixed { position: fixed !important; }
.pizza-house-root .absolute { position: absolute !important; }
.pizza-house-root .relative { position: relative !important; }
.pizza-house-root .sticky { position: sticky !important; }
.pizza-house-root .inset-0 { inset: 0 !important; }
.pizza-house-root .top-0 { top: 0 !important; }
.pizza-house-root .left-0 { left: 0 !important; }
.pizza-house-root .bottom-0 { bottom: 0 !important; }
.pizza-house-root .right-0 { right: 0 !important; }
.pizza-house-root .z-10 { z-index: 10 !important; }
.pizza-house-root .z-50 { z-index: 50 !important; }

/* Text alignment */
.pizza-house-root .text-left { text-align: left !important; }
.pizza-house-root .text-center { text-align: center !important; }
.pizza-house-root .text-right { text-align: right !important; }

/* Gap */
.pizza-house-root .gap-1 { gap: 0.25rem !important; }
.pizza-house-root .gap-2 { gap: 0.5rem !important; }
.pizza-house-root .gap-3 { gap: 0.75rem !important; }
.pizza-house-root .gap-4 { gap: 1rem !important; }
.pizza-house-root .gap-6 { gap: 1.5rem !important; }
.pizza-house-root .gap-8 { gap: 2rem !important; }
.pizza-house-root .gap-12 { gap: 3rem !important; }
.pizza-house-root .gap-16 { gap: 4rem !important; }
.pizza-house-root .gap-1\\.5 { gap: 0.375rem !important; }
.pizza-house-root .gap-2\\.5 { gap: 0.625rem !important; }
.pizza-house-root .gap-3\\.5 { gap: 0.875rem !important; }

/* Padding */
.pizza-house-root .p-1 { padding: 0.25rem !important; }
.pizza-house-root .p-2 { padding: 0.5rem !important; }
.pizza-house-root .p-3 { padding: 0.75rem !important; }
.pizza-house-root .p-4 { padding: 1rem !important; }
.pizza-house-root .p-6 { padding: 1.5rem !important; }
.pizza-house-root .p-8 { padding: 2rem !important; }
.pizza-house-root .p-12 { padding: 3rem !important; }
.pizza-house-root .p-3\\.5 { padding: 0.875rem !important; }
.pizza-house-root .px-3 { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
.pizza-house-root .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
.pizza-house-root .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
.pizza-house-root .px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
.pizza-house-root .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
.pizza-house-root .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
.pizza-house-root .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
.pizza-house-root .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
.pizza-house-root .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
.pizza-house-root .py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
.pizza-house-root .py-10 { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
.pizza-house-root .py-16 { padding-top: 4rem !important; padding-bottom: 4rem !important; }
.pizza-house-root .py-24 { padding-top: 6rem !important; padding-bottom: 6rem !important; }
.pizza-house-root .py-28 { padding-top: 7rem !important; padding-bottom: 7rem !important; }
.pizza-house-root .pt-1 { padding-top: 0.25rem !important; }
.pizza-house-root .pt-2 { padding-top: 0.5rem !important; }
.pizza-house-root .pt-6 { padding-top: 1.5rem !important; }
.pizza-house-root .pt-20 { padding-top: 5rem !important; }
.pizza-house-root .pb-6 { padding-bottom: 1.5rem !important; }
.pizza-house-root .py-2\\.5 { padding-top: 0.625rem !important; padding-bottom: 0.625rem !important; }
.pizza-house-root .py-3\\.5 { padding-top: 0.875rem !important; padding-bottom: 0.875rem !important; }

/* Margin */
.pizza-house-root .mx-auto { margin-left: auto !important; margin-right: auto !important; }
.pizza-house-root .mb-1 { margin-bottom: 0.25rem !important; }
.pizza-house-root .mb-2 { margin-bottom: 0.5rem !important; }
.pizza-house-root .mb-3 { margin-bottom: 0.75rem !important; }
.pizza-house-root .mb-4 { margin-bottom: 1rem !important; }
.pizza-house-root .mb-6 { margin-bottom: 1.5rem !important; }
.pizza-house-root .mb-8 { margin-bottom: 2rem !important; }
.pizza-house-root .mt-2 { margin-top: 0.5rem !important; }
.pizza-house-root .mt-4 { margin-top: 1rem !important; }
.pizza-house-root .mt-6 { margin-top: 1.5rem !important; }

/* Overflow */
.pizza-house-root .overflow-hidden { overflow: hidden !important; }
.pizza-house-root .overflow-y-auto { overflow-y: auto !important; }

/* Border radius */
.pizza-house-root .rounded { border-radius: 0.25rem !important; }
.pizza-house-root .rounded-lg { border-radius: 0.5rem !important; }
.pizza-house-root .rounded-xl { border-radius: 0.75rem !important; }
.pizza-house-root .rounded-2xl { border-radius: 1rem !important; }
.pizza-house-root .rounded-3xl { border-radius: 1.5rem !important; }
.pizza-house-root .rounded-full { border-radius: 9999px !important; }

/* Object fit */
.pizza-house-root .object-cover { object-fit: cover !important; }
.pizza-house-root .object-contain { object-fit: contain !important; }

/* Opacity */
.pizza-house-root .opacity-0 { opacity: 0 !important; }
.pizza-house-root .opacity-50 { opacity: 0.5 !important; }
.pizza-house-root .opacity-100 { opacity: 1 !important; }

/* Max width */
.pizza-house-root .max-w-sm { max-width: 24rem !important; }
.pizza-house-root .max-w-md { max-width: 28rem !important; }
.pizza-house-root .max-w-lg { max-width: 32rem !important; }
.pizza-house-root .max-w-xl { max-width: 36rem !important; }
.pizza-house-root .max-w-2xl { max-width: 42rem !important; }
.pizza-house-root .max-w-3xl { max-width: 48rem !important; }
.pizza-house-root .max-w-7xl { max-width: 80rem !important; }

/* Cursor */
.pizza-house-root .cursor-pointer { cursor: pointer !important; }

/* Transition */
.pizza-house-root .transition-all { transition-property: all !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }
.pizza-house-root .transition-colors { transition-property: color, background-color, border-color !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; transition-duration: 150ms !important; }

/* Backdrop blur */
.pizza-house-root .backdrop-blur-xl { backdrop-filter: blur(24px) !important; }

/* Antialiased */
.pizza-house-root .antialiased { -webkit-font-smoothing: antialiased !important; }

/* Pointer events */
.pizza-house-root .pointer-events-none { pointer-events: none !important; }

/* Space y */
.pizza-house-root .space-y-4 > * + * { margin-top: 1rem !important; }
.pizza-house-root .space-y-6 > * + * { margin-top: 1.5rem !important; }
.pizza-house-root .space-y-8 > * + * { margin-top: 2rem !important; }

/* ==================== PIZZA HOUSE: SM BREAKPOINT OVERRIDES ==================== */
@media (min-width: 640px) {
  .pizza-house-root .sm\\:flex-row { flex-direction: row !important; }
  .pizza-house-root .sm\\:gap-3 { gap: 0.75rem !important; }
  .pizza-house-root .sm\\:gap-4 { gap: 1rem !important; }
  .pizza-house-root .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .pizza-house-root .sm\\:h-52 { height: 13rem !important; }
  .pizza-house-root .sm\\:h-72 { height: 18rem !important; }
  .pizza-house-root .sm\\:h-96 { height: 24rem !important; }
  .pizza-house-root .sm\\:h-\\[480px\\] { height: 480px !important; }
  .pizza-house-root .sm\\:inline-flex { display: inline-flex !important; }
  .pizza-house-root .sm\\:items-start { align-items: flex-start !important; }
  .pizza-house-root .sm\\:max-w-lg { max-width: 32rem !important; }
  .pizza-house-root .sm\\:p-12 { padding: 3rem !important; }
  .pizza-house-root .sm\\:text-left { text-align: left !important; }
  .pizza-house-root .sm\\:top-4 { top: 1rem !important; }
  .pizza-house-root .sm\\:top-10 { top: 2.5rem !important; }
  .pizza-house-root .sm\\:w-96 { width: 24rem !important; }
  .pizza-house-root .sm\\:w-auto { width: auto !important; }
  .pizza-house-root .sm\\:-left-4 { left: -1rem !important; }
  .pizza-house-root .sm\\:-left-6 { left: -1.5rem !important; }
  .pizza-house-root .sm\\:-right-6 { right: -1.5rem !important; }
  .pizza-house-root .sm\\:bottom-6 { bottom: 1.5rem !important; }
}

/* ==================== PIZZA HOUSE: MD BREAKPOINT OVERRIDES ==================== */
@media (min-width: 768px) {
  .pizza-house-root .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .pizza-house-root .md\\:inline-flex { display: inline-flex !important; }
  .pizza-house-root .md\\:flex { display: flex !important; }
}

/* ==================== PIZZA HOUSE: LG BREAKPOINT OVERRIDES ==================== */
@media (min-width: 1024px) {
  .pizza-house-root .lg\\:flex { display: flex !important; }
  .pizza-house-root .lg\\:hidden { display: none !important; }
  .pizza-house-root .lg\\:block { display: block !important; }
  .pizza-house-root .lg\\:grid { display: grid !important; }
  .pizza-house-root .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .pizza-house-root .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
  .pizza-house-root .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
  .pizza-house-root .lg\\:col-span-6 { grid-column: span 6 / span 6 !important; }
  .pizza-house-root .lg\\:col-span-5 { grid-column: span 5 / span 5 !important; }
  .pizza-house-root .lg\\:col-span-7 { grid-column: span 7 / span 7 !important; }
  .pizza-house-root .lg\\:gap-8 { gap: 2rem !important; }
  .pizza-house-root .lg\\:gap-16 { gap: 4rem !important; }
  .pizza-house-root .lg\\:px-12 { padding-left: 3rem !important; padding-right: 3rem !important; }
  .pizza-house-root .lg\\:py-24 { padding-top: 6rem !important; padding-bottom: 6rem !important; }
  .pizza-house-root .lg\\:py-28 { padding-top: 7rem !important; padding-bottom: 7rem !important; }
  .pizza-house-root .lg\\:items-center { align-items: center !important; }
  .pizza-house-root .lg\\:flex-row { flex-direction: row !important; }
}
`;

const globalsPath = 'src/app/globals.css';
let content = fs.readFileSync(globalsPath, 'utf8');

const marker = '/* ==================== PIZZA HOUSE: RESPONSIVE UTILITIES';
if (content.includes(marker)) {
  // Replace from marker to end of file
  const idx = content.indexOf(marker);
  content = content.substring(0, idx) + pizzaHouseUtilCSS.trim();
} else {
  content += pizzaHouseUtilCSS;
}

fs.writeFileSync(globalsPath, content);
console.log('Successfully added Pizza House responsive utilities to globals.css!');
console.log('New file size:', content.length);

