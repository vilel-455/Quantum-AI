const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix overlap
content = content.replace(/pt-\[350px\] md:pt-48 lg:pt-32/, 'pt-[220px] sm:pt-40 md:pt-40 lg:pt-32');
content = content.replace(/bg-\[\#0f172a\]/g, 'bg-[#1A365D]');
content = content.replace(/bg-\[\#1e293b\]/g, 'bg-[#2B6CB0]');
content = content.replace(/text-gray-400(?=.*strokeWidth)/g, 'text-gray-300');

fs.writeFileSync('src/App.tsx', content);
