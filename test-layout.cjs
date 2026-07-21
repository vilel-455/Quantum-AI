const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    <div id="home" className="relative min-h-screen flex flex-col justify-between pt-20">
      <div className="absolute inset-0 overflow-hidden z-0">`;
const replace = `    <div id="home" className="relative min-h-screen flex flex-col justify-between pt-20 bg-white">
      <div className="absolute inset-x-0 top-0 h-[75vh] md:h-auto md:inset-0 overflow-hidden z-0">`;

content = content.replace(search, replace);
fs.writeFileSync('src/App.tsx', content);
