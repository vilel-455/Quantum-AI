const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/bg-red-500 text-white rounded-full shadow-2xl hover:bg-red-600/, 'bg-[#E53E3E] text-white rounded-full shadow-2xl hover:bg-[#E25C5C]');

fs.writeFileSync('src/App.tsx', content);
