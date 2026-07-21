const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchAnim = `<motion.div key={currentSlide} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.5 }}>`;
const replaceAnim = `<motion.div key={currentSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>`;

content = content.replace(searchAnim, replaceAnim);
fs.writeFileSync('src/App.tsx', content);
console.log("Updated hero text anim.");
