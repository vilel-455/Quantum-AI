const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/import \{ Menu, X, motion, AnimatePresence \} from 'motion\/react';/, "import { motion, AnimatePresence } from 'motion/react';");
if (!content.includes('Menu,') || !content.includes('X,')) {
    content = content.replace(/import \{/, "import { Menu, X,");
}

fs.writeFileSync('src/App.tsx', content);
