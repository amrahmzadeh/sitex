const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/components/themes/PizzaHouseSite.tsx');
let code = fs.readFileSync(targetFile, 'utf8');

// 0. Ensure scoped CSS has .bg-white, .text-white, and placeholder styling
if (!code.includes('.pizza-house-root .bg-white {')) {
  code = code.replace(
    '.pizza-house-root {',
    `.pizza-house-root .bg-white { background-color: #ffffff !important; }
.pizza-house-root .text-white { color: #ffffff !important; }
.pizza-house-root .border-white { border-color: #ffffff !important; }
.pizza-house-root input::placeholder, .pizza-house-root textarea::placeholder { color: rgba(220, 217, 217, 0.6) !important; }
.pizza-house-root {`
  );
}

// 1. NAVBAR - ensure desktop nav items have proper padding, colors, and right controls have styled CTA and profile icon
const navPattern = /{\/\* Desktop Navigation Menu \*\/}[\s\S]*?<\/nav>/;
const newNav = `{/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={\`transition-all py-2 px-4 rounded-xl cursor-pointer font-label-lg text-label-lg \${
                    isActive ? 'font-bold' : 'hover:text-[#b20028]'
                  }\`}
                  style={
                    isActive
                      ? { backgroundColor: '#d7263d', color: '#ffffff', boxShadow: '0 2px 8px rgba(215, 38, 61, 0.25)' }
                      : { color: '#5b403f' }
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>`;

code = code.replace(navPattern, newNav);

// Right Header controls profile avatar: ensure it is always visible and perfectly circular
const profilePattern = /<div[\s\S]*?className="[^"]*?rounded-full[^"]*?shrink-0"[\s\S]*?title="Pizza House"[\s\S]*?>[\s\S]*?<\/div>/;
const newProfile = `<div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: '#b20028', color: '#ffffff' }}
                title="Pizza House"
              >
                <Users size={16} />
              </div>`;

code = code.replace(profilePattern, newProfile);

// 2. HERO - ensure buttons are inline flex with exact code.html styles and stats chips are elevated cards
const heroStatsPattern = /{\/\* 3 Stats Chips \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*{\/\* Right Column: Visual Pizza Showcase \*\//;
const newHeroStats = `{/* 3 Stats Chips */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 w-full max-w-lg">
                  <div
                    className="p-3.5 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:items-start border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Star size={18} className="fill-[#fbbc0c] text-[#fbbc0c] shrink-0" />
                      <span className="font-bold text-base sm:text-lg text-[#1c1b1b]">
                        {theme.heroStat1Value || '10+ il'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat1Label || 'Təcrübə'}
                    </span>
                  </div>

                  <div
                    className="p-3.5 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:items-start border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Flame size={18} className="fill-[#d7263d] text-[#d7263d] shrink-0" />
                      <span className="font-bold text-base sm:text-lg text-[#1c1b1b]">
                        {theme.heroStat2Value || '30+'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat2Label || 'Pizza növü'}
                    </span>
                  </div>

                  <div
                    className="p-3.5 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center sm:items-start border"
                    style={{ backgroundColor: '#ffffff', borderColor: '#f0eded' }}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Users size={18} className="text-[#fc9430] shrink-0" />
                      <span className="font-bold text-base sm:text-lg text-[#1c1b1b]">
                        {theme.heroStat3Value || '5000+'}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-[#5b403f] text-center sm:text-left">
                      {theme.heroStat3Label || 'Məmnun qonaq'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Pizza Showcase */`;

code = code.replace(heroStatsPattern, newHeroStats);

// Hero Floating Badge 2 ("100% Təbii"): ensure guaranteed white card background and contrast
const badge2Pattern = /{\/\* Floating Badge 2: 100% Mozzarella \*\/}[\s\S]*?<\/div>\s*<\/div>\s*{\/\* Floating Badge 3/;
const newBadge2 = `{/* Floating Badge 2: 100% Mozzarella */}
                  <div
                    className="absolute -bottom-4 -left-2 sm:bottom-6 sm:-left-4 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#f0eded] z-20"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#ffdad9', color: '#b20028' }}
                    >
                      <Flame size={18} className="fill-[#b20028] text-[#b20028]" />
                    </div>
                    <div>
                      <p className="font-headline-sm text-sm sm:text-base font-bold leading-tight text-[#1c1b1b]">
                        {theme.heroBadgeFeature1 || '100% Təbii'}
                      </p>
                      <p className="font-label-sm text-xs text-[#5b403f]">
                        {theme.heroBadgeFeature1Desc || 'Pendir & Xəmir'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 3`;

code = code.replace(badge2Pattern, newBadge2);

// Hero Floating Badge 1 & 3: ensure backgroundColor: '#ffffff' and z-20
code = code.replace(
  'className="absolute -top-3 -left-3 sm:top-4 sm:-left-6 bg-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce border border-[#f0eded]"',
  'className="absolute -top-3 -left-3 sm:top-4 sm:-left-6 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce border border-[#f0eded] z-20" style={{ animationDuration: "4s", backgroundColor: "#ffffff" }}'
);

code = code.replace(
  'className="absolute -top-3 -right-2 sm:top-10 sm:-right-6 bg-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#f0eded]"',
  'className="absolute -top-3 -right-2 sm:top-10 sm:-right-6 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#f0eded] z-20" style={{ backgroundColor: "#ffffff" }}'
);

// 3. MENYU - category tabs active/inactive styles, card images, add to order button
const menuCatsPattern = /{\/\* Category Filter Pills \*\/}[\s\S]*?<\/div>\s*{\/\* 3-Column Menu Grid \*\//;
const newMenuCats = `{/* Category Filter Pills */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full pb-4 mb-10 no-scrollbar">
                {categoriesList.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={\`px-6 py-2.5 rounded-full font-label-lg text-label-lg transition-all cursor-pointer whitespace-nowrap shadow-sm \${
                        isSelected ? 'font-bold' : 'hover:opacity-90'
                      }\`}
                      style={
                        isSelected
                          ? { backgroundColor: '#d7263d', color: '#ffffff', boxShadow: '0 4px 12px rgba(215, 38, 61, 0.25)' }
                          : { backgroundColor: '#e5e2e1', color: '#1c1b1b' }
                      }
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* 3-Column Menu Grid */`;

code = code.replace(menuCatsPattern, newMenuCats);

// Menu item button: ensure guaranteed red background and hover styling
const menuCardBtnPattern = /{\/\* Add to Order Button \*\/}[\s\S]*?<\/button>/;
const newMenuCardBtn = `{/* Add to Order Button */}
                      <button
                        onClick={() => handleAddToCart(item.name, priceFormatted)}
                        disabled={isOrdersPaused}
                        className={\`w-full py-3 px-4 rounded-xl font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer \${
                          isOrdersPaused
                            ? 'cursor-not-allowed'
                            : 'hover:-translate-y-0.5'
                        }\`}
                        style={
                          isOrdersPaused
                            ? { backgroundColor: '#e5e2e1', color: '#5b403f' }
                            : { backgroundColor: '#d7263d', color: '#ffffff', boxShadow: '0 2px 8px rgba(215, 38, 61, 0.2)' }
                        }
                      >
                        <span className="text-lg font-bold">+</span>
                        <span>{isOrdersPaused ? 'Sifariş bağlıdır' : 'Əlavə et'}</span>
                      </button>`;

code = code.replace(menuCardBtnPattern, newMenuCardBtn);

// 4. HAQQIMIZDA - Center badge and 3 feature cards
const aboutCenterBadgePattern = /{\/\* Decorative Center Badge \*\/}[\s\S]*?<\/div>\s*<\/div>\s*{\/\* Right Column: Story & Features \*\//;
const newAboutCenterBadge = `{/* Decorative Center Badge */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full flex flex-col items-center justify-center p-2 text-center shadow-2xl z-20 border-4 border-white"
                  style={{ backgroundColor: '#d7263d', color: '#ffffff' }}
                >
                  <span className="font-headline-sm text-2xl leading-none font-bold text-white">
                    {theme.aboutEstablishedYear || '2014'}
                  </span>
                  <span className="font-label-sm text-xs mt-1 text-white/90 font-medium">
                    {theme.aboutEstablishedText || 'İldən bəri sevgiylə'}
                  </span>
                </div>
              </div>

              {/* Right Column: Story & Features */`;

code = code.replace(aboutCenterBadgePattern, newAboutCenterBadge);

// 5. REZERVASİYA - Form inputs uniform height, border, background, focus ring, submit button
const resInputsPattern = /{!bookingSuccess \? \([\s\S]*?<\/form>/;
const newResInputs = `{!bookingSuccess ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Ad və Soyad */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Ad və soyad *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={booking.name}
                            onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                            placeholder="Məs: Elvin Məmmədov"
                            className="w-full px-4 py-3.5 rounded-xl font-body-md text-body-md transition-all focus:outline-none focus:ring-2 focus:ring-[#d7263d]"
                            style={{
                              backgroundColor: '#1c1b1b',
                              color: '#f3f0ef',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              height: '52px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Telefon Nömrəsi */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Telefon nömrəsi *
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={booking.phone}
                            onChange={(e) => setBooking({ ...booking, phone: e.target.value })}
                            placeholder="+994 50 123 45 67"
                            className="w-full px-4 py-3.5 rounded-xl font-body-md text-body-md transition-all focus:outline-none focus:ring-2 focus:ring-[#d7263d]"
                            style={{
                              backgroundColor: '#1c1b1b',
                              color: '#f3f0ef',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              height: '52px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Tarix */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Tarix *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            required
                            value={booking.date}
                            onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl font-body-md text-body-md transition-all focus:outline-none focus:ring-2 focus:ring-[#d7263d]"
                            style={{
                              backgroundColor: '#1c1b1b',
                              color: '#f3f0ef',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              height: '52px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Saat */}
                      <div className="flex flex-col space-y-2">
                        <label className="font-label-md text-label-md text-[#dcd9d9]">
                          Saat *
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={booking.time}
                            onChange={(e) => setBooking({ ...booking, time: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl font-body-md text-body-md transition-all focus:outline-none focus:ring-2 focus:ring-[#d7263d] appearance-none"
                            style={{
                              backgroundColor: '#1c1b1b',
                              color: '#f3f0ef',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              height: '52px',
                            }}
                          >
                            <option disabled value="">
                              Saat seçin
                            </option>
                            <option value="12:00">12:00 - Günorta</option>
                            <option value="13:30">13:30</option>
                            <option value="15:00">15:00</option>
                            <option value="18:00">18:00 - Axşam</option>
                            <option value="19:30">19:30</option>
                            <option value="21:00">21:00</option>
                            <option value="22:00">22:00</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Nəfər Sayı */}
                    <div className="flex flex-col space-y-2">
                      <label className="font-label-md text-label-md text-[#dcd9d9]">
                        Nəfər sayı *
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={booking.guests}
                          onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl font-body-md text-body-md transition-all focus:outline-none focus:ring-2 focus:ring-[#d7263d] appearance-none"
                          style={{
                            backgroundColor: '#1c1b1b',
                            color: '#f3f0ef',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            height: '52px',
                          }}
                        >
                          <option value="2 nəfər">2 nəfər (Romantik masa)</option>
                          <option value="3-4 nəfər">3-4 nəfər (Ailəvi masa)</option>
                          <option value="5-6 nəfər">5-6 nəfər (Dost masası)</option>
                          <option value="7+ nəfər">7+ nəfər (Böyük qrup / Ad günü)</option>
                        </select>
                      </div>
                    </div>

                    {/* Əlavə Qeyd */}
                    <div className="flex flex-col space-y-2">
                      <label className="font-label-md text-label-md text-[#dcd9d9]">
                        Əlavə qeyd
                      </label>
                      <textarea
                        rows={3}
                        value={booking.notes}
                        onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                        placeholder="Xüsusi istək və ya pəhriz tələbləriniz varsa qeyd edin..."
                        className="w-full px-4 py-3.5 rounded-xl font-body-md text-body-md transition-all focus:outline-none focus:ring-2 focus:ring-[#d7263d] resize-none"
                        style={{
                          backgroundColor: '#1c1b1b',
                          color: '#f3f0ef',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          minHeight: '100px',
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                      style={{
                        backgroundColor: '#d7263d',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px -3px rgba(215, 38, 61, 0.35)',
                        height: '56px',
                      }}
                    >
                      <Calendar size={22} />
                      <span>
                        {bookingLoading ? 'Göndərilir...' : 'Rezervasiyanı təsdiqlə'}
                      </span>
                    </button>
                  </form>`;

code = code.replace(resInputsPattern, newResInputs);

// 6. FOOTER - background #313030, high contrast headings, clean alignments
const footerPattern = /<footer[\s\S]*?style={{\s*backgroundColor:\s*['"][^'"]*['"],[\s\S]*?}}[\s\S]*?>[\s\S]*?<div className="max-w-7xl mx-auto">/;
const newFooterHeader = `<footer
        className="w-full text-white pt-16 pb-12 px-6 lg:px-12 border-t"
        style={{
          backgroundColor: '#313030',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto">`;

code = code.replace(footerPattern, newFooterHeader);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully applied all visual fixes to PizzaHouseSite.tsx!');

