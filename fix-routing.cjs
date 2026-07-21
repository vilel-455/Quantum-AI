const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import FAQPage from './FAQPage';")) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport FAQPage from './FAQPage';");
}

// Update Navbar to take currentPage and setCurrentPage
if (!content.includes('const Navbar = ({ currentPage, setCurrentPage }) => {') && !content.includes('const Navbar = ({ setCurrentPage }) => {') && !content.includes('const Navbar = ({ setCurrentPage }:')) {
  content = content.replace('const Navbar = () => {', 'const Navbar = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {');
}

// Update navLinks hrefs to use onClick
content = content.replace(/<a\s+key=\{index\}\s+href=\{link.href\}\s+className="text-white font-semibold text-sm hover:text-\[\#E53E3E\] transition-colors duration-300"\s+>/g, 
  `<a
                key={index}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (link.name === 'FAQ') {
                    setCurrentPage('faq');
                    window.scrollTo(0,0);
                  } else if (link.name === 'Home') {
                    setCurrentPage('home');
                    window.scrollTo(0,0);
                  }
                }}
                className="text-white font-semibold text-sm hover:text-[#E53E3E] transition-colors duration-300"
              >`);

content = content.replace(/<a\s+key=\{index\}\s+href=\{link.href\}\s+className="block text-white font-semibold text-base hover:text-\[\#E53E3E\] transition-colors duration-300"\s+onClick=\{\(\) => setIsOpen\(false\)\}\s+>/g,
  `<a
                  key={index}
                  href={link.href}
                  className="block text-white font-semibold text-base hover:text-[#E53E3E] transition-colors duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    if (link.name === 'FAQ') {
                      setCurrentPage('faq');
                      window.scrollTo(0,0);
                    } else if (link.name === 'Home') {
                      setCurrentPage('home');
                      window.scrollTo(0,0);
                    }
                    setIsOpen(false);
                  }}
                >`);

// Now update App component to include state and conditional rendering
const appRegex = /export default function App\(\) \{\n  return \(\n    <div className="font-sans text-\[\#2D3748\] bg-white">\n       <Navbar \/>\n([\s\S]*?)       <Footer \/>\n       <BackToTop \/>\n    <\/div>\n  \);\n\}/;

const match = content.match(appRegex);

if (match) {
  const sections = match[1];
  const newAppCode = `export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="font-sans text-[#2D3748] bg-white">
       <Navbar setCurrentPage={setCurrentPage} />
       {currentPage === 'home' ? (
         <>
${sections}         </>
       ) : (
         <FAQPage />
       )}
       <Footer />
       <BackToTop />
    </div>
  );
}`;
  content = content.replace(appRegex, newAppCode);
}

fs.writeFileSync('src/App.tsx', content);
