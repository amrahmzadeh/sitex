const fs = require('fs');
let comp = fs.readFileSync('src/components/themes/PizzaHouseSite.tsx', 'utf8');

// 1. Add inline style to reservation section
comp = comp.replace(
  'id="rezervasiya"\n          >',
  'id="rezervasiya"\n            style={{ backgroundColor: "#1c1b1b", color: "#ffffff" }}\n          >'
);

// 2. Ensure reservation inputs have inline styles so they NEVER turn white
const oldInputs = 'className="w-full bg-[#1c1b1b] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-[#d7263d] focus:outline-none transition-colors"';
const newInputs = 'className="w-full px-4 py-3.5 rounded-xl border focus:outline-none transition-colors" style={{ backgroundColor: "#1c1b1b", color: "#ffffff", borderColor: "rgba(255, 255, 255, 0.15)" }}';
comp = comp.split(oldInputs).join(newInputs);

// 3. Ensure reservation submit button has inline red styling
const btnIdx = comp.indexOf('Rezervasiyanı təsdiqlə');
if (btnIdx !== -1) {
  const btnStart = comp.lastIndexOf('<button', btnIdx);
  const btnTagEnd = comp.indexOf('>', btnStart);
  const oldBtnTag = comp.substring(btnStart, btnTagEnd + 1);
  const newBtnTag = `<button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                      style={{
                        backgroundColor: '#d7263d',
                        color: '#ffffff',
                        boxShadow: '0 10px 25px -3px rgba(215, 38, 61, 0.35)',
                      }}
                    >`;
  comp = comp.substring(0, btnStart) + newBtnTag + comp.substring(btnTagEnd + 1);
  console.log('Fixed reservation submit button with inline style!');
}

fs.writeFileSync('src/components/themes/PizzaHouseSite.tsx', comp, 'utf8');
console.log('Updated reservation styling!');
