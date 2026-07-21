const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update Navbar classes
content = content.replace(
  /<nav className="absolute top-0 w-full z-50 bg-\[\#1A365D\]\/90 backdrop-blur-sm border-b border-white\/10">/,
  '<nav className="sticky top-0 w-full z-50 bg-[#070B19]">'
);

// We need to completely rewrite HeroSection.
// Let's find the boundaries of HeroSection
const heroStart = content.indexOf('const HeroSection = ({ setCurrentPage }');
const heroEnd = content.indexOf('const ExploreSolution = ({ setCurrentPage }');
if (heroStart === -1 || heroEnd === -1) {
  console.log("Could not find HeroSection");
  process.exit(1);
}

const newHero = `const HeroSection = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  return (
    <div id="home" className="relative bg-[#070B19] text-white min-h-[90vh] flex flex-col justify-center">
      <div className="absolute inset-0 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: \`url('https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80')\` }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B19]/90 via-[#070B19]/50 to-transparent" />
      </div>
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 pt-20 pb-40 h-full flex flex-col justify-center pointer-events-none">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm font-bold tracking-wider uppercase mb-4 text-white"
        >
          We are here for
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl lg:text-7xl font-bold mb-10 max-w-2xl leading-tight font-serif"
        >
          Your tomorrow starts<br/>from here
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pointer-events-auto w-fit"
        >
          <button onClick={() => { setCurrentPage('register'); window.scrollTo(0,0); }} className="px-8 py-3 border border-white rounded-full font-bold hover:bg-white hover:text-[#070B19] transition-all duration-300 text-sm tracking-wider">
            GET STARTED
          </button>
        </motion.div>
      </div>
      
      {/* Cards at the bottom */}
      <div className="absolute bottom-0 left-0 w-full px-6 lg:px-12 z-20 pointer-events-none pb-6">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pointer-events-auto">
          {[
            { title: 'Stocks', icon: BarChart2 },
            { title: 'Bonds and ETFs', icon: FileText },
            { title: 'Crypto', icon: CircleDollarSign },
            { title: 'Real Estate Investing', icon: Building },
          ].map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
              key={i} 
              className="bg-[#0B132B]/90 backdrop-blur-sm h-48 py-8 px-6 flex flex-col justify-between hover:bg-[#14234B] transition-colors cursor-pointer border-t-2 border-transparent hover:border-blue-500"
            >
              <div>
                <item.icon className="w-10 h-10 mb-4 text-white" strokeWidth={1} />
              </div>
              <span className="font-bold text-white text-xl font-serif leading-tight pr-4">{item.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

`;

content = content.substring(0, heroStart) + newHero + content.substring(heroEnd);

// Ensure icons are imported
// We need BarChart2, FileText, CircleDollarSign
const lucideImportsMatch = content.match(/import \{([^}]+)\} from 'lucide-react';/);
if (lucideImportsMatch) {
  let imports = lucideImportsMatch[1];
  if (!imports.includes('BarChart2')) imports += ', BarChart2';
  if (!imports.includes('FileText')) imports += ', FileText';
  if (!imports.includes('CircleDollarSign')) imports += ', CircleDollarSign';
  content = content.replace(lucideImportsMatch[0], `import {${imports}} from 'lucide-react';`);
}

fs.writeFileSync('src/App.tsx', content);
