const fs = require('fs');
const path = require('path');

const compPath = path.join(__dirname, '../src/components/themes/PizzaHouseSite.tsx');
let comp = fs.readFileSync(compPath, 'utf8');

console.log('Original size:', comp.length);

// 1. HEADER FIX: Ensure active link has red background, and CTA button has red background with inline styles
const oldHeaderNav = `{navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={\`transition-colors py-1.5 px-3 rounded-xl cursor-pointer \${
                    isActive
                      ? 'bg-[#d7263d] text-white font-bold'
                      : 'text-[#5b403f] hover:text-[#b20028] font-label-lg text-label-lg'
                  }\`}
                >
                  {item.label}
                </button>
              );
            })}`;

const newHeaderNav = `{navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={\`transition-colors py-1.5 px-3.5 rounded-xl cursor-pointer font-medium text-sm \${
                    isActive
                      ? 'font-bold'
                      : 'hover:text-[#b20028]'
                  }\`}
                  style={
                    isActive
                      ? { backgroundColor: '#d7263d', color: '#ffffff' }
                      : { color: '#5b403f' }
                  }
                >
                  {item.label}
                </button>
              );
            })}`;

if (comp.includes(oldHeaderNav)) {
  comp = comp.replace(oldHeaderNav, newHeaderNav);
  console.log('1. Replaced header nav with inline styles!');
} else {
  console.log('1. Warning: oldHeaderNav not matched');
}

// 2. HEADER CTA BUTTON FIX:
const oldHeaderCta = `<button
              onClick={() => scrollTo('rezervasiya')}
              className="hidden sm:inline-flex items-center justify-center bg-[#d7263d] hover:bg-[#b20028] text-white font-label-lg text-label-lg px-6 py-2.5 rounded-xl shadow-[0_4px_16px_-2px_rgba(26,26,26,0.05),0_2px_6px_-1px_rgba(215,38,61,0.03)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Rezervasiya et
            </button>`;

const newHeaderCta = `<div className="flex items-center gap-3">
              <button
                onClick={() => scrollTo('rezervasiya')}
                className="hidden sm:inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer hover:-translate-y-0.5"
                style={{
                  backgroundColor: '#d7263d',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px -2px rgba(26,26,26,0.05), 0 2px 6px -1px rgba(215,38,61,0.25)',
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

if (comp.includes(oldHeaderCta)) {
  comp = comp.replace(oldHeaderCta, newHeaderCta);
  console.log('2. Replaced header CTA button with inline styles and avatar!');
} else {
  console.log('2. Warning: oldHeaderCta not matched');
}

// 3. HERO PILL BADGE & CTA BUTTONS & STATS CHIPS:
// Let's replace the Hero Left column actions
const oldHeroActions = `{/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-1 w-full sm:w-auto">
                  <button
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
                  </button>
                </div>`;

const newHeroActions = `{/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-3 w-full sm:w-auto">
                  <button
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
                  </button>
                </div>`;

if (comp.includes(oldHeroActions)) {
  comp = comp.replace(oldHeroActions, newHeroActions);
  console.log('3. Replaced Hero CTA buttons with rock-solid styles!');
} else {
  console.log('3. Warning: oldHeroActions not matched');
}

// 4. HERO STATS CHIPS - Ensure gold star, red pizza, orange smile icons and borders
const oldHeroStats = `{/* 3 Stats Chips */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 w-full max-w-lg">
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

const newHeroStats = `{/* 3 Stats Chips */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 w-full max-w-lg">
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

if (comp.includes(oldHeroStats)) {
  comp = comp.replace(oldHeroStats, newHeroStats);
  console.log('4. Replaced Hero Stats chips with styled cards!');
} else {
  console.log('4. Warning: oldHeroStats not matched');
}

// 5. RESERVATION SECTION: Ensure it ALWAYS renders as a dark container with inline style fallbacks
// Look for reservation section tag
const oldResSection = `id="rezervasiya"
          style={{
            backgroundColor: theme.formBgColor || '#313030',
          }}`;

const newResSection = `id="rezervasiya"
          style={{
            backgroundColor: '#1c1b1b',
            color: '#ffffff',
          }}`;

if (comp.includes(oldResSection)) {
  comp = comp.replace(oldResSection, newResSection);
  console.log('5. Fixed Reservation section dark background!');
} else {
  // Try alternative matching
  const resRegex = /id="rezervasiya"[\s\S]*?style=\{[\s\S]*?\}\>/;
  if (resRegex.test(comp)) {
    comp = comp.replace(resRegex, `id="rezervasiya"
          className="relative py-20 lg:py-28 px-6 lg:px-12 overflow-hidden"
          style={{ backgroundColor: '#1c1b1b', color: '#ffffff' }}>`);
    console.log('5b. Fixed Reservation section tag via regex!');
  }
}

// 6. CONTACT SECTION (Image 1 fix):
// Update the 4 contact cards to have explicit padding, margins, borders, and icon containers
const oldContactCards = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ünvan */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdad9] text-[#b20028] flex items-center justify-center mb-3">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        Ünvan
                      </p>
                      <p className="font-headline-sm text-headline-sm text-[#1c1b1b] mt-1 leading-snug">
                        {organization.address || 'Nizami küçəsi 45, Bakı şəhəri'}
                      </p>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        {organization.city || 'Fəvvarələr meydanı yaxınlığı'}
                      </p>
                    </div>
                  </div>

                  {/* Telefon */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] text-[#914d00] flex items-center justify-center mb-3">
                      <Phone size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        Telefon
                      </p>
                      <a
                        href={\`tel:\${organization.phone || '+994125980000'}\`}
                        className="block font-headline-sm text-headline-sm text-[#1c1b1b] hover:text-[#b20028] transition-colors mt-1"
                      >
                        {organization.phone || '+994 12 598 00 00'}
                      </a>
                      <a
                        href="tel:+994502000000"
                        className="block font-body-sm text-body-sm text-[#5b403f] hover:text-[#b20028] transition-colors mt-0.5"
                      >
                        +994 50 200 00 00
                      </a>
                    </div>
                  </div>

                  {/* E-poçt */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdea0] text-[#715300] flex items-center justify-center mb-3">
                      <Mail size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        E-poçt
                      </p>
                      <a
                        href={\`mailto:\${organization.email || 'info@pizzahouse.az'}\`}
                        className="block font-headline-sm text-headline-sm text-[#1c1b1b] hover:text-[#b20028] transition-colors mt-1 truncate"
                      >
                        {organization.email || 'info@pizzahouse.az'}
                      </a>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        Dərhal cavablandırılır
                      </p>
                    </div>
                  </div>

                  {/* İş saatları */}
                  <div className="p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between border border-[#f0eded]">
                    <div className="w-10 h-10 rounded-xl bg-[#ffdad9] text-[#b20028] flex items-center justify-center mb-3">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="font-label-sm text-label-sm text-[#5b403f] uppercase font-bold tracking-wider">
                        İş saatları
                      </p>
                      <p className="font-headline-sm text-headline-sm text-[#1c1b1b] mt-1">
                        Hər gün
                      </p>
                      <p className="font-body-sm text-body-sm text-[#5b403f] mt-0.5">
                        10:00 – 23:00 fasiləsiz
                      </p>
                    </div>
                  </div>
                </div>`;

const newContactCards = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ünvan */}
                  <div
                    className="p-5 rounded-2xl shadow-sm flex flex-col justify-between border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: '#ffdad9', color: '#b20028' }}
                    >
                      <MapPin size={22} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-[#5b403f]">
                        Ünvan
                      </p>
                      <p className="font-bold text-base text-[#1c1b1b] mt-1 leading-snug">
                        {organization.address || 'Bakı şəhəri, Nizami küçəsi 45'}
                      </p>
                      <p className="text-xs text-[#5b403f] mt-0.5">
                        {organization.city || 'Fəvvarələr meydanı yaxınlığı'}
                      </p>
                    </div>
                  </div>

                  {/* Telefon */}
                  <div
                    className="p-5 rounded-2xl shadow-sm flex flex-col justify-between border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: '#ffdcc3', color: '#914d00' }}
                    >
                      <Phone size={22} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-[#5b403f]">
                        Telefon
                      </p>
                      <a
                        href={\`tel:\${organization.phone || '+994125980000'}\`}
                        className="block font-bold text-base text-[#1c1b1b] hover:text-[#b20028] transition-colors mt-1"
                      >
                        {organization.phone || '+994 12 598 00 00'}
                      </a>
                      <a
                        href="tel:+994502000000"
                        className="block text-xs text-[#5b403f] hover:text-[#b20028] transition-colors mt-0.5"
                      >
                        +994 50 200 00 00
                      </a>
                    </div>
                  </div>

                  {/* E-poçt */}
                  <div
                    className="p-5 rounded-2xl shadow-sm flex flex-col justify-between border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: '#ffdea0', color: '#715300' }}
                    >
                      <Mail size={22} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-[#5b403f]">
                        E-poçt
                      </p>
                      <a
                        href={\`mailto:\${organization.email || 'info@pizzahouse.az'}\`}
                        className="block font-bold text-base text-[#1c1b1b] hover:text-[#b20028] transition-colors mt-1 truncate"
                      >
                        {organization.email || 'info@pizzahouse.az'}
                      </a>
                      <p className="text-xs text-[#5b403f] mt-0.5">
                        Dərhal cavablandırılır
                      </p>
                    </div>
                  </div>

                  {/* İş saatları */}
                  <div
                    className="p-5 rounded-2xl shadow-sm flex flex-col justify-between border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: '#ffdad9', color: '#b20028' }}
                    >
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-[#5b403f]">
                        İş saatları
                      </p>
                      <p className="font-bold text-base text-[#1c1b1b] mt-1">
                        Hər gün
                      </p>
                      <p className="text-xs text-[#5b403f] mt-0.5">
                        10:00 – 23:00 fasiləsiz
                      </p>
                    </div>
                  </div>
                </div>`;

if (comp.includes(oldContactCards)) {
  comp = comp.replace(oldContactCards, newContactCards);
  console.log('6. Replaced Contact Cards with pixel-perfect styled cards!');
} else {
  console.log('6. Warning: oldContactCards not matched');
}

// 7. FOOTER FIX (Image 2 fix):
const oldFooter = `<footer className="w-full bg-[#313030] text-[#f3f0ef] pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">`;

const newFooter = `<footer
        className="w-full text-white pt-16 pb-12 px-6 lg:px-12 border-t"
        style={{
          backgroundColor: '#1c1b1b',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">`;

if (comp.includes(oldFooter)) {
  comp = comp.replace(oldFooter, newFooter);
  console.log('7. Replaced Footer wrapper with generous padding and dark tone!');
} else {
  console.log('7. Warning: oldFooter not matched');
}

fs.writeFileSync(compPath, comp, 'utf8');
console.log('Finished updating PizzaHouseSite.tsx! New length:', comp.length);
