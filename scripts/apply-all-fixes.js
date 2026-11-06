const fs = require('fs');

let comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

// 1. Header Nav Active Styling with inline styles
const navOld = `<button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={\`transition-colors py-1 px-3 rounded-xl cursor-pointer \${
                    isActive
                      ? 'bg-[#d7263d] text-white font-bold'
                      : 'text-[#5b403f] hover:text-[#b20028] font-label-lg text-label-lg'
                  }\`}
                >`;

const navNew = `<button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={\`transition-colors py-1.5 px-3.5 rounded-xl cursor-pointer font-medium text-sm \${
                    isActive ? 'font-bold' : 'hover:text-[#b20028]'
                  }\`}
                  style={
                    isActive
                      ? { backgroundColor: '#d7263d', color: '#ffffff' }
                      : { color: '#5b403f' }
                  }
                >`;

if (comp.includes(navOld)) {
  comp = comp.replace(navOld, navNew);
  console.log('1. Header nav fixed');
} else {
  console.log('1. navOld not found');
}

// 2. Header CTA Button + Profile Avatar
const ctaOld = `<button
              onClick={() => scrollTo('rezervasiya')}
              className="hidden sm:inline-flex items-center justify-center bg-[#d7263d] hover:bg-[#b20028] text-white font-label-lg text-label-lg px-6 py-2.5 rounded-xl shadow-[0_4px_16px_-2px_rgba(26,26,26,0.05),0_2px_6px_-1px_rgba(215,38,61,0.03)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Rezervasiya et
            </button>`;

const ctaNew = `<div className="flex items-center gap-3">
              <button
                onClick={() => scrollTo('rezervasiya')}
                className="hidden sm:inline-flex items-center justify-center font-semibold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
                style={{
                  backgroundColor: '#d7263d',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px -2px rgba(26,26,26,0.05), 0 2px 6px -1px rgba(215,38,61,0.3)',
                }}
              >
                Rezervasiya et
              </button>
              <div
                className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-white shrink-0"
                style={{ backgroundColor: '#b20028' }}
                title="Pizza House"
              >
                <Users size={16} />
              </div>
            </div>`;

if (comp.includes(ctaOld)) {
  comp = comp.replace(ctaOld, ctaNew);
  console.log('2. Header CTA fixed');
} else {
  console.log('2. ctaOld not found');
}

// 3. Hero CTA Buttons side by side with inline styles
const heroCtaOld = `<button
                    onClick={() => scrollTo('menyu')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d7263d] hover:bg-[#b20028] text-white font-label-lg text-label-lg px-8 py-3.5 rounded-xl shadow-lg shadow-[#d7263d]/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <span>{theme.heroCta1 || 'Menyuya bax'}</span>
                    <UtensilsCrossed size={19} />
                  </button>

                  <button
                    onClick={() => scrollTo('rezervasiya')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f0eded] hover:bg-[#e5e2e1] text-[#1c1b1b] font-label-lg text-label-lg px-8 py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    <span>{theme.heroCta2 || 'Masa rezerv et'}</span>
                    <Calendar size={19} />
                  </button>`;

const heroCtaNew = `<button
                    onClick={() => scrollTo('menyu')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-base px-8 py-3.5 rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
                    style={{
                      backgroundColor: '#d7263d',
                      color: '#ffffff',
                      boxShadow: '0 10px 20px -3px rgba(215, 38, 61, 0.3)',
                    }}
                  >
                    <span>{theme.heroCta1 || 'Menyuya bax'}</span>
                    <UtensilsCrossed size={19} />
                  </button>

                  <button
                    onClick={() => scrollTo('rezervasiya')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold text-base px-8 py-3.5 rounded-xl transition-all cursor-pointer hover:-translate-y-0.5 border"
                    style={{
                      backgroundColor: '#f0eded',
                      color: '#1c1b1b',
                      borderColor: '#eae7e7',
                    }}
                  >
                    <span>{theme.heroCta2 || 'Masa rezerv et'}</span>
                    <Calendar size={19} />
                  </button>`;

if (comp.includes(heroCtaOld)) {
  comp = comp.replace(heroCtaOld, heroCtaNew);
  console.log('3. Hero CTA buttons fixed');
} else {
  console.log('3. heroCtaOld not found');
}

// 4. Hero Stats Chips
const statsOld = `<div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 w-full max-w-lg">
                  <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border border-[#f0eded]">
                    <div className="flex items-center gap-1 text-[#715300] font-bold mb-1">
                      <Star size={18} className="fill-[#fbbc0c] text-[#fbbc0c]" />
                      <span className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.heroStat1Value || '10+ il'}
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat1Label || 'Təcrübə'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border border-[#f0eded]">
                    <div className="flex items-center gap-1 text-[#b20028] font-bold mb-1">
                      <Flame size={18} className="fill-[#b20028] text-[#b20028]" />
                      <span className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.heroStat2Value || '30+'}
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat2Label || 'Pizza növü'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border border-[#f0eded]">
                    <div className="flex items-center gap-1 text-[#914d00] font-bold mb-1">
                      <Users size={18} className="text-[#914d00]" />
                      <span className="font-headline-sm text-headline-sm text-[#1c1b1b]">
                        {theme.heroStat3Value || '5000+'}
                      </span>
                    </div>
                    <span className="font-label-md text-label-md text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat3Label || 'Məmnun qonaq'}
                    </span>
                  </div>
                </div>`;

const statsNew = `<div className="grid grid-cols-3 gap-3 sm:gap-4 pt-8 w-full max-w-lg">
                  <div
                    className="p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div className="flex items-center gap-1 font-bold mb-1">
                      <Star size={18} className="fill-[#fbbc0c] text-[#fbbc0c]" />
                      <span className="font-bold text-base sm:text-lg text-[#1c1b1b]">
                        {theme.heroStat1Value || '10+ il'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat1Label || 'Təcrübə'}
                    </span>
                  </div>

                  <div
                    className="p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div className="flex items-center gap-1 font-bold mb-1">
                      <Flame size={18} className="fill-[#d7263d] text-[#d7263d]" />
                      <span className="font-bold text-base sm:text-lg text-[#1c1b1b]">
                        {theme.heroStat2Value || '30+'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat2Label || 'Pizza növü'}
                    </span>
                  </div>

                  <div
                    className="p-3.5 rounded-2xl shadow-sm flex flex-col items-center sm:items-start border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div className="flex items-center gap-1 font-bold mb-1">
                      <Users size={18} className="text-[#fc9430]" />
                      <span className="font-bold text-base sm:text-lg text-[#1c1b1b]">
                        {theme.heroStat3Value || '5000+'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat3Label || 'Məmnun qonaq'}
                    </span>
                  </div>
                </div>`;

if (comp.includes(statsOld)) {
  comp = comp.replace(statsOld, statsNew);
  console.log('4. Hero Stats fixed');
} else {
  console.log('4. statsOld not found');
}

// 5. Reservation Section - Ensure container is ALWAYS dark #1c1b1b
const resTagOld = `id="rezervasiya"
          className="relative py-20 lg:py-28 px-6 lg:px-12 overflow-hidden"
          style={{
            backgroundColor: theme.formBgColor || '#313030',
          }}`;

const resTagNew = `id="rezervasiya"
          className="relative py-20 lg:py-28 px-6 lg:px-12 overflow-hidden"
          style={{
            backgroundColor: '#1c1b1b',
            color: '#ffffff',
          }}`;

if (comp.includes(resTagOld)) {
  comp = comp.replace(resTagOld, resTagNew);
  console.log('5. Reservation section tag fixed');
} else {
  console.log('5. resTagOld not found');
}

// 6. Reservation Form Card: ensure dark container #313030
const resCardOld = `<div className="bg-[#313030] rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/5">`;
const resCardNew = `<div
                className="rounded-3xl p-8 sm:p-12 shadow-2xl border"
                style={{
                  backgroundColor: '#313030',
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >`;

if (comp.includes(resCardOld)) {
  comp = comp.replace(resCardOld, resCardNew);
  console.log('6. Reservation card fixed');
} else {
  console.log('6. resCardOld not found');
}

// 7. Reservation Submit Button
const resBtnOld = `<button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-[#d7263d] hover:bg-[#b20028] text-white font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[#d7263d]/30 hover:-translate-y-0.5 cursor-pointer"
                  >`;

const resBtnNew = `<button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer"
                    style={{
                      backgroundColor: '#d7263d',
                      color: '#ffffff',
                      boxShadow: '0 10px 25px -3px rgba(215, 38, 61, 0.35)',
                    }}
                  >`;

if (comp.includes(resBtnOld)) {
  comp = comp.replace(resBtnOld, resBtnNew);
  console.log('7. Reservation submit button fixed');
} else {
  console.log('7. resBtnOld not found');
}

// 8. Contact Section Wrapper - Ensure #fcf9f8 background and padding
const contactSecOld = `id="elaqe">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">`;

const contactSecNew = `id="elaqe"
            className="py-20 lg:py-28 px-6 lg:px-12"
            style={{ backgroundColor: '#fcf9f8' }}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">`;

if (comp.includes(contactSecOld)) {
  comp = comp.replace(contactSecOld, contactSecNew);
  console.log('8. Contact section wrapper fixed');
} else {
  console.log('8. contactSecOld not found');
}

// 9. Contact Card Icon Containers - Add explicit inline style colors
comp = comp.replace(
  '<div className="w-10 h-10 rounded-xl bg-[#ffdad9] text-[#b20028] flex items-center justify-center mb-3">\n                      <MapPin size={22} />\n                    </div>',
  '<div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "#ffdad9", color: "#b20028" }}>\n                      <MapPin size={22} />\n                    </div>'
);

comp = comp.replace(
  '<div className="w-10 h-10 rounded-xl bg-[#ffdcc3] text-[#914d00] flex items-center justify-center mb-3">\n                      <Phone size={22} />\n                    </div>',
  '<div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "#ffdcc3", color: "#914d00" }}>\n                      <Phone size={22} />\n                    </div>'
);

comp = comp.replace(
  '<div className="w-10 h-10 rounded-xl bg-[#ffdea0] text-[#715300] flex items-center justify-center mb-3">\n                      <Mail size={22} />\n                    </div>',
  '<div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "#ffdea0", color: "#715300" }}>\n                      <Mail size={22} />\n                    </div>'
);

// 10. Footer Wrapper - generous padding, dark #1c1b1b tone
const footerOld = `<footer className="w-full bg-[#313030] text-[#f3f0ef] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">`;

const footerNew = `<footer
        className="w-full text-white pt-16 pb-12 px-6 lg:px-12 border-t"
        style={{
          backgroundColor: '#1c1b1b',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">`;

if (comp.includes(footerOld)) {
  comp = comp.replace(footerOld, footerNew);
  console.log('10. Footer wrapper fixed');
} else {
  console.log('10. footerOld not found');
}

fs.writeFileSync('src/components/themes/PizzaHouseSite.tsx', comp, 'utf8');
console.log('All fixes applied to PizzaHouseSite.tsx!');
