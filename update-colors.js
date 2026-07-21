const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Colors replacement
content = content.replace(/bg-gray-900/g, 'bg-[#1A365D]');
content = content.replace(/text-gray-900/g, 'text-[#1A365D]');
content = content.replace(/text-gray-800/g, 'text-[#2D3748]');
content = content.replace(/bg-red-500/g, 'bg-[#E53E3E]');
content = content.replace(/text-red-500/g, 'text-[#E53E3E]');
content = content.replace(/border-red-500/g, 'border-[#E53E3E]');
content = content.replace(/shadow-red-500\/30/g, 'shadow-[#E53E3E]/30');
content = content.replace(/bg-blue-600/g, 'bg-[#3182CE]');
content = content.replace(/text-blue-600/g, 'text-[#3182CE]');
content = content.replace(/shadow-blue-600\/30/g, 'shadow-[#3182CE]/30');
content = content.replace(/text-blue-900/g, 'text-[#1A365D]');
content = content.replace(/bg-gray-50(?=[\s\/])/g, 'bg-[#F7FAFC]');
content = content.replace(/bg-\[\#070b19\]/g, 'bg-[#1A365D]');
content = content.replace(/bg-\[\#242b42\]/g, 'bg-[#1A365D]');
content = content.replace(/hover:bg-red-600/g, 'hover:bg-[#E25C5C]');
content = content.replace(/hover:text-red-500/g, 'hover:text-[#E53E3E]');
content = content.replace(/hover:bg-blue-700/g, 'hover:bg-[#2B6CB0]');

// Fix overlap
content = content.replace(/pt-40 md:pt-48/, 'pt-64 md:pt-48 lg:pt-32');

// Fix button text on mobile hover label
content = content.replace(/text-xs font-bold text-gray-400 hover:text-blue-600/g, 'text-[14px] font-bold text-gray-400 hover:text-[#3182CE] tracking-[0.05em]');

fs.writeFileSync('src/App.tsx', content);
