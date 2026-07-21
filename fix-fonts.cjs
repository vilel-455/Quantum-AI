const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add font-serif to Hero title if missing
content = content.replace(/className="text-5xl lg:text-7xl font-bold mb-10 max-w-2xl leading-tight"/, 'className="text-5xl lg:text-7xl font-bold mb-10 max-w-2xl leading-tight font-serif"');

fs.writeFileSync('src/App.tsx', content);
