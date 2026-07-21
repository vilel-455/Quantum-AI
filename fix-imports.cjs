const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove Menu and X from motion/react
content = content.replace(/import \{ Menu, X,  motion/, 'import { motion');

// Add Menu and X to lucide-react
if (!content.includes('Menu,') && !content.includes('X,')) {
  content = content.replace(/import \{/, 'import { Menu, X,');
}

fs.writeFileSync('src/App.tsx', content);
