const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('font-serif')) {
  console.log("Missing font-serif");
}
if (!content.includes('bg-[#1A365D]')) {
  console.log("Missing primary color");
}
