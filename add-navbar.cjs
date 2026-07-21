const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add Menu and X icons if they aren't imported
if (!content.includes('Menu,') && !content.includes('Menu }')) {
  content = content.replace(/import \{/, 'import { Menu, X, ');
} else if (!content.includes('X,') && !content.includes('X }')) {
  content = content.replace(/import \{/, 'import { X, ');
}

// Navbar component
const navbarCode = `
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#' },
    { name: 'FAQ', href: '#' },
    { name: 'Plans', href: '#' },
    { name: 'Contact', href: '#' },
    { name: 'Login', href: '#' },
    { name: 'Register', href: '#' },
  ];

  return (
    <nav className="absolute top-0 w-full z-50 bg-[#1A365D]/90 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-1 text-[#E53E3E] font-bold text-xl tracking-widest cursor-pointer">
            <span className="text-3xl text-white">T</span>ESLA
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-white font-semibold text-sm hover:text-[#E53E3E] transition-colors duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[#E53E3E] focus:outline-none transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1A365D] border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="block text-white font-semibold text-base hover:text-[#E53E3E] transition-colors duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
`;

// Insert after HeroSection imports or before HeroSection
content = content.replace(/const HeroSection = \(\) => \{/, navbarCode + '\nconst HeroSection = () => {');

// Add Navbar to App
content = content.replace(/<div className="font-sans text-\[\#2D3748\] bg-white">/, '<div className="font-sans text-[#2D3748] bg-white">\n       <Navbar />');

fs.writeFileSync('src/App.tsx', content);
