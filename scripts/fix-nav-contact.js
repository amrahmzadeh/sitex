const fs = require('fs');
let comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

// 1. Fix navItems.map
const oldNav = `<button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={\`transition-colors py-1 px-3 rounded-xl cursor-pointer \${
                    isActive
                      ? 'bg-[#d7263d] text-white font-bold'
                      : 'text-[#5b403f] hover:text-[#b20028] font-label-lg text-label-lg'
                  }\`}
                >`;

const newNav = `<button
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

if (comp.includes(oldNav)) {
  comp = comp.replace(oldNav, newNav);
  console.log('Fixed navItems buttons!');
} else {
  console.log('oldNav still not found');
}

// 2. Fix Contact Cards
const contactStart = comp.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">\n                  {/* Ünvan */}');
if (contactStart !== -1) {
  const contactEnd = comp.indexOf('</div>\n                </div>\n\n                {/* Social Media Badges */}', contactStart);
  if (contactEnd !== -1) {
    const newCards = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    comp = comp.substring(0, contactStart) + newCards + comp.substring(contactEnd + 6);
    console.log('Fixed Contact cards cleanly!');
  } else {
    console.log('contactEnd not found');
  }
} else {
  console.log('contactStart not found');
}

fs.writeFileSync('src/components/themes/PizzaHouseSite.tsx', comp, 'utf8');
console.log('Wrote updated PizzaHouseSite.tsx!');
