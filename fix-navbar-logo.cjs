const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<div className="flex-shrink-0 flex items-center gap-3 cursor-pointer">/, 
  `<div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentPage('home'); window.scrollTo(0,0); }}>`);

fs.writeFileSync('src/App.tsx', content);
