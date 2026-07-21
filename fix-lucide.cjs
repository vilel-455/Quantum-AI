const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix motion import
content = content.replace("import { Menu, X, motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");

// Fix lucide import
content = content.replace("import {\n  TrendingUp", "import {\n  Menu,\n  X,\n  TrendingUp");

fs.writeFileSync('src/App.tsx', content);
