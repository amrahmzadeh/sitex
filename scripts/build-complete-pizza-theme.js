const fs = require('fs');
const path = require('path');

const colors = {
  "on-background": "#1c1b1b",
  "surface-container-highest": "#e5e2e1",
  "on-primary-container": "#fff2f1",
  "error": "#ba1a1a",
  "on-tertiary": "#ffffff",
  "primary-fixed": "#ffdad9",
  "inverse-surface": "#313030",
  "secondary-fixed": "#ffdcc3",
  "tertiary-fixed-dim": "#fbbc0c",
  "on-tertiary-fixed": "#261a00",
  "on-error-container": "#93000a",
  "on-secondary-fixed-variant": "#6e3900",
  "on-surface-variant": "#5b403f",
  "surface-tint": "#bd0a2e",
  "on-tertiary-fixed-variant": "#5c4300",
  "surface-bright": "#fcf9f8",
  "background": "#fcf9f8",
  "surface-container-lowest": "#ffffff",
  "outline-variant": "#e4bdbc",
  "on-secondary-fixed": "#2f1500",
  "secondary-container": "#fc9430",
  "secondary": "#914d00",
  "primary": "#b20028",
  "inverse-primary": "#ffb3b2",
  "on-primary": "#ffffff",
  "on-tertiary-container": "#fff3e3",
  "on-secondary-container": "#663500",
  "secondary-fixed-dim": "#ffb77d",
  "on-surface": "#1c1b1b",
  "outline": "#906f6e",
  "error-container": "#ffdad6",
  "surface": "#fcf9f8",
  "on-error": "#ffffff",
  "surface-container-low": "#f6f3f2",
  "on-secondary": "#ffffff",
  "on-primary-fixed": "#410008",
  "tertiary-container": "#8f6a00",
  "on-primary-fixed-variant": "#92001f",
  "inverse-on-surface": "#f3f0ef",
  "surface-container": "#f0eded",
  "surface-container-high": "#eae7e7",
  "surface-variant": "#e5e2e1",
  "tertiary": "#715300",
  "surface-dim": "#dcd9d9",
  "tertiary-fixed": "#ffdea0",
  "primary-container": "#d7263d",
  "primary-fixed-dim": "#ffb3b2"
};

const spacings = {
  "margin": "3rem",
  "gutter": "1.5rem",
  "gutter-mobile": "1rem",
  "space-sm": "0.5rem",
  "margin-mobile": "1.25rem",
  "space-lg": "1.5rem",
  "space-xs": "0.25rem",
  "space-md": "1rem",
  "space-xl": "2.5rem"
};

let css = `/* Pizza House Complete Style Definition (Self-Contained) */
@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined' !important;
  font-weight: normal !important;
  font-style: normal !important;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

.pizza-house-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  color: #1c1b1b;
  background-color: #fcf9f8;
  -webkit-font-smoothing: antialiased;
}

.pizza-house-root ::selection {
  background-color: #ffdad9 !important;
  color: #410008 !important;
}

/* Typography tokens */
.pizza-house-root .font-display-hero,
.pizza-house-root .text-display-hero {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 56px !important;
  line-height: 64px !important;
  letter-spacing: -0.03em !important;
  font-weight: 800 !important;
}
@media (max-width: 768px) {
  .pizza-house-root .font-display-hero,
  .pizza-house-root .text-display-hero {
    font-size: 38px !important;
    line-height: 44px !important;
    letter-spacing: -0.02em !important;
  }
}

.pizza-house-root .font-display-hero-mobile,
.pizza-house-root .text-display-hero-mobile {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 38px !important;
  line-height: 44px !important;
  letter-spacing: -0.02em !important;
  font-weight: 800 !important;
}

.pizza-house-root .font-headline-xl,
.pizza-house-root .text-headline-xl {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 40px !important;
  line-height: 48px !important;
  letter-spacing: -0.02em !important;
  font-weight: 700 !important;
}
@media (max-width: 768px) {
  .pizza-house-root .font-headline-xl,
  .pizza-house-root .text-headline-xl {
    font-size: 30px !important;
    line-height: 36px !important;
    letter-spacing: -0.01em !important;
  }
}

.pizza-house-root .font-headline-xl-mobile,
.pizza-house-root .text-headline-xl-mobile {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 30px !important;
  line-height: 36px !important;
  letter-spacing: -0.01em !important;
  font-weight: 700 !important;
}

.pizza-house-root .font-headline-lg,
.pizza-house-root .text-headline-lg {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 28px !important;
  line-height: 34px !important;
  letter-spacing: -0.01em !important;
  font-weight: 700 !important;
}

.pizza-house-root .font-headline-md,
.pizza-house-root .text-headline-md {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 22px !important;
  line-height: 28px !important;
  font-weight: 600 !important;
}

.pizza-house-root .font-headline-sm,
.pizza-house-root .text-headline-sm {
  font-family: 'Epilogue', sans-serif !important;
  font-size: 18px !important;
  line-height: 24px !important;
  font-weight: 600 !important;
}

.pizza-house-root .font-label-lg,
.pizza-house-root .text-label-lg {
  font-family: 'Inter', sans-serif !important;
  font-size: 15px !important;
  line-height: 20px !important;
  letter-spacing: 0.01em !important;
  font-weight: 600 !important;
}

.pizza-house-root .font-label-md,
.pizza-house-root .text-label-md {
  font-family: 'Inter', sans-serif !important;
  font-size: 13px !important;
  line-height: 18px !important;
  letter-spacing: 0.02em !important;
  font-weight: 600 !important;
}

.pizza-house-root .font-label-sm,
.pizza-house-root .text-label-sm {
  font-family: 'Inter', sans-serif !important;
  font-size: 11px !important;
  line-height: 14px !important;
  letter-spacing: 0.04em !important;
  font-weight: 700 !important;
}

.pizza-house-root .font-body-lg,
.pizza-house-root .text-body-lg {
  font-family: 'Inter', sans-serif !important;
  font-size: 18px !important;
  line-height: 28px !important;
  font-weight: 400 !important;
}

.pizza-house-root .font-body-md,
.pizza-house-root .text-body-md {
  font-family: 'Inter', sans-serif !important;
  font-size: 16px !important;
  line-height: 24px !important;
  font-weight: 400 !important;
}

.pizza-house-root .font-body-sm,
.pizza-house-root .text-body-sm {
  font-family: 'Inter', sans-serif !important;
  font-size: 14px !important;
  line-height: 20px !important;
  font-weight: 400 !important;
}
`;

// Add Semantic Token Classes (bg-*, text-*, border-*, hover:*, fill-*)
for (const [name, hex] of Object.entries(colors)) {
  css += `
.pizza-house-root .bg-${name} { background-color: ${hex} !important; }
.pizza-house-root .text-${name} { color: ${hex} !important; }
.pizza-house-root .border-${name} { border-color: ${hex} !important; }
.pizza-house-root .fill-${name} { fill: ${hex} !important; }
.pizza-house-root .hover\\:bg-${name}:hover { background-color: ${hex} !important; }
.pizza-house-root .hover\\:text-${name}:hover { color: ${hex} !important; }
.pizza-house-root .group:hover .group-hover\\:text-${name} { color: ${hex} !important; }
`;
}

// Add opacity variants for common tokens
const opacities = [10, 20, 40, 60, 80, 85, 90];
for (const op of opacities) {
  const alpha = (op / 100).toFixed(2);
  css += `
.pizza-house-root .bg-primary-container\\/${op} { background-color: rgba(215, 38, 61, ${alpha}) !important; }
.pizza-house-root .bg-primary-fixed\\/${op} { background-color: rgba(255, 218, 217, ${alpha}) !important; }
.pizza-house-root .bg-secondary-fixed\\/${op} { background-color: rgba(255, 220, 195, ${alpha}) !important; }
.pizza-house-root .bg-secondary-container\\/${op} { background-color: rgba(252, 148, 48, ${alpha}) !important; }
.pizza-house-root .bg-surface-container-highest\\/${op} { background-color: rgba(229, 226, 225, ${alpha}) !important; }
.pizza-house-root .bg-inverse-surface\\/${op} { background-color: rgba(49, 48, 48, ${alpha}) !important; }
.pizza-house-root .bg-on-background\\/${op} { background-color: rgba(28, 27, 27, ${alpha}) !important; }
.pizza-house-root .bg-surface\\/${op} { background-color: rgba(252, 249, 248, ${alpha}) !important; }
.pizza-house-root .border-white\\/${op} { border-color: rgba(255, 255, 255, ${alpha}) !important; }
.pizza-house-root .divide-white\\/${op} > * + * { border-color: rgba(255, 255, 255, ${alpha}) !important; }
.pizza-house-root .shadow-primary-container\\/${op} { box-shadow: 0 10px 15px -3px rgba(215, 38, 61, ${alpha}) !important; }
`;
}

// Add Spacing Tokens
for (const [name, val] of Object.entries(spacings)) {
  css += `
.pizza-house-root .p-${name} { padding: ${val} !important; }
.pizza-house-root .pt-${name} { padding-top: ${val} !important; }
.pizza-house-root .pb-${name} { padding-bottom: ${val} !important; }
.pizza-house-root .px-${name} { padding-left: ${val} !important; padding-right: ${val} !important; }
.pizza-house-root .py-${name} { padding-top: ${val} !important; padding-bottom: ${val} !important; }
.pizza-house-root .m-${name} { margin: ${val} !important; }
.pizza-house-root .mt-${name} { margin-top: ${val} !important; }
.pizza-house-root .mb-${name} { margin-bottom: ${val} !important; }
.pizza-house-root .gap-${name} { gap: ${val} !important; }
.pizza-house-root .space-y-${name} > * + * { margin-top: ${val} !important; }
.pizza-house-root .space-x-${name} > * + * { margin-left: ${val} !important; }
`;
}

// Add Missing Utility Classes
css += `
/* Dimension, Spacing & Layout Utilities */
.pizza-house-root .py-3\\.5 { padding-top: 0.875rem !important; padding-bottom: 0.875rem !important; }
.pizza-house-root .px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
.pizza-house-root .py-2\\.5 { padding-top: 0.625rem !important; padding-bottom: 0.625rem !important; }
.pizza-house-root .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
.pizza-house-root .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
.pizza-house-root .p-3\\.5 { padding: 0.875rem !important; }
.pizza-house-root .p-6 { padding: 1.5rem !important; }
.pizza-house-root .p-8 { padding: 2rem !important; }
.pizza-house-root .p-12 { padding: 3rem !important; }
.pizza-house-root .pt-20 { padding-top: 5rem !important; }
.pizza-house-root .pt-28 { padding-top: 7rem !important; }
.pizza-house-root .pb-28 { padding-bottom: 7rem !important; }
.pizza-house-root .py-28 { padding-top: 7rem !important; padding-bottom: 7rem !important; }
.pizza-house-root .h-20 { height: 5rem !important; }
.pizza-house-root .w-auto { width: auto !important; }
.pizza-house-root .w-full { width: 100% !important; }
.pizza-house-root .max-w-7xl { max-width: 80rem !important; }
.pizza-house-root .max-w-xl { max-width: 36rem !important; }
.pizza-house-root .max-w-lg { max-width: 32rem !important; }
.pizza-house-root .max-w-md { max-width: 28rem !important; }
.pizza-house-root .aspect-square { aspect-ratio: 1 / 1 !important; }
.pizza-house-root .aspect-\\[4\\/3\\] { aspect-ratio: 4 / 3 !important; }
.pizza-house-root .aspect-\\[16\\/9\\] { aspect-ratio: 16 / 9 !important; }
.pizza-house-root .aspect-\\[3\\/4\\] { aspect-ratio: 3 / 4 !important; }

/* Border Radius */
.pizza-house-root .rounded-xl { border-radius: 0.75rem !important; }
.pizza-house-root .rounded-2xl { border-radius: 1rem !important; }
.pizza-house-root .rounded-3xl { border-radius: 1.5rem !important; }
.pizza-house-root .rounded-\\[2rem\\] { border-radius: 2rem !important; }
.pizza-house-root .rounded-\\[2\\.5rem\\] { border-radius: 2.5rem !important; }
.pizza-house-root .rounded-full { border-radius: 9999px !important; }

/* Shadows */
.pizza-house-root .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
.pizza-house-root .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1) !important; }
.pizza-house-root .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) !important; }
.pizza-house-root .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; }
.pizza-house-root .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
.pizza-house-root .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06) !important; }
.pizza-house-root .shadow-\\[0_1px_8px_rgba\\(0\\,0\\,0\\,0\\.04\\)\\] { box-shadow: 0 1px 8px rgba(0,0,0,0.04) !important; }
.pizza-house-root .shadow-\\[0_4px_16px_-2px_rgba\\(26\\,26\\,26\\,0\\.05\\)\\,0_2px_6px_-1px_rgba\\(215\\,38\\,61\\,0\\.03\\)\\] { box-shadow: 0 4px 16px -2px rgba(26,26,26,0.05), 0 2px 6px -1px rgba(215,38,61,0.03) !important; }

/* Transitions & Transforms */
.pizza-house-root .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 200ms; }
.pizza-house-root .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 200ms; }
.pizza-house-root .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 300ms; }
.pizza-house-root .hover\\:-translate-y-0\\.5:hover { transform: translateY(-2px) !important; }
.pizza-house-root .hover\\:-translate-y-1:hover { transform: translateY(-4px) !important; }
.pizza-house-root .hover\\:scale-105:hover { transform: scale(1.05) !important; }
.pizza-house-root .group:hover .group-hover\\:scale-105 { transform: scale(1.05) !important; }
.pizza-house-root .group:hover .group-hover\\:scale-110 { transform: scale(1.1) !important; }

/* Backdrop & Filter */
.pizza-house-root .blur-2xl { filter: blur(40px) !important; }
.pizza-house-root .blur-3xl { filter: blur(64px) !important; }
.pizza-house-root .backdrop-blur-xl { backdrop-filter: blur(24px) !important; -webkit-backdrop-filter: blur(24px) !important; }

/* Gradients */
.pizza-house-root .bg-gradient-to-t { background-image: linear-gradient(to top, var(--tw-gradient-stops)) !important; }
.pizza-house-root .from-\\[\\#1c1b1b\\]\\/80 { --tw-gradient-from: rgba(28,27,27,0.8); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(28,27,27,0)); }
.pizza-house-root .from-black\\/80 { --tw-gradient-from: rgba(0,0,0,0.8); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0,0,0,0)); }
.pizza-house-root .via-\\[\\#1c1b1b\\]\\/20 { --tw-gradient-to: rgba(28,27,27,0); --tw-gradient-stops: var(--tw-gradient-from), rgba(28,27,27,0.2), var(--tw-gradient-to); }
.pizza-house-root .to-transparent { --tw-gradient-to: transparent !important; }

/* Animation */
@keyframes bounceSlow {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}
.pizza-house-root .animate-bounce {
  animation: bounceSlow 4s infinite !important;
}
`;

// Write to src/components/themes/pizza-house-generated.css
const cssPath = path.join(__dirname, '../src/components/themes/pizza-house-generated.css');
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Saved generated CSS to', cssPath, 'Length:', css.length);

// Also append to globals.css if not already present
const globalsPath = path.join(__dirname, '../src/app/globals.css');
let globals = fs.readFileSync(globalsPath, 'utf8');
const marker = '/* ==================== PIZZA HOUSE: COMPLETE DEFINITIONS ==================== */';
if (globals.includes(marker)) {
  const parts = globals.split(marker);
  globals = parts[0] + marker + '\n' + css;
} else {
  globals += '\n\n' + marker + '\n' + css;
}
fs.writeFileSync(globalsPath, globals, 'utf8');
console.log('Updated globals.css with complete Pizza House definitions!');
