const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find all Navbar declarations and remove all but one, and remove multiple <Navbar /> from App
const navbarRegex = /const Navbar = \(\) => \{[\s\S]*?\};\n\n/g;
let matches = [...content.matchAll(navbarRegex)];
if (matches.length > 1) {
  for (let i = 1; i < matches.length; i++) {
    content = content.replace(matches[i][0], '');
  }
}

const renderRegex = /<Navbar \/>\n\s*<Navbar \/>/g;
while(renderRegex.test(content)) {
  content = content.replace(/<Navbar \/>\n\s*<Navbar \/>/g, '<Navbar />');
}

fs.writeFileSync('src/App.tsx', content);
