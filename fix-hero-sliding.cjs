const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchHero = `const HeroSection = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="home" className="relative min-h-screen flex flex-col justify-between pt-20">
      <div className="absolute inset-0 overflow-hidden z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: \`url('\${slides[currentSlide].image}')\` }}
          />
        </AnimatePresence>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B19]/90 via-[#070B19]/60 to-black/40" />
      </div>
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex-grow flex flex-col justify-center py-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
            <p className="text-xs lg:text-sm font-semibold tracking-wider uppercase mb-4 text-white">
              {slides[currentSlide].subtitle}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-10 max-w-2xl leading-tight font-serif text-white">
              {slides[currentSlide].title}
            </h1>
          </motion.div>
        </AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pointer-events-auto w-fit"
        >
          <button onClick={() => { setCurrentPage('register'); window.scrollTo(0,0); }} className="px-8 py-3 border border-white rounded-full font-semibold hover:bg-white hover:text-[#070B19] transition-all duration-300 text-sm tracking-wider text-white">
            GET STARTED
          </button>
        </motion.div>
      </div>`;

const replaceHero = `const HeroSection = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 15000); // 15s delay
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="home" className="relative min-h-screen flex flex-col justify-between pt-20">
      <div className="absolute inset-0 overflow-hidden z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ x: '100%', scale: 1 }}
            animate={{ x: 0, scale: 1.1 }}
            exit={{ x: '-100%', scale: 1.1 }}
            transition={{ 
              x: { type: "tween", duration: 1, ease: "easeInOut" },
              scale: { duration: 15, ease: "linear" }
            }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: \`url('\${slides[currentSlide].image}')\` }}
          />
        </AnimatePresence>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B19]/90 via-[#070B19]/60 to-black/40" />
      </div>
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 flex-grow flex flex-col justify-center py-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.5 }}>
            <p className="text-xs lg:text-sm font-semibold tracking-wider uppercase mb-4 text-white">
              {slides[currentSlide].subtitle}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-10 max-w-2xl leading-tight font-serif text-white">
              {slides[currentSlide].title}
            </h1>
            <div className="pointer-events-auto w-fit">
              <button onClick={() => { setCurrentPage('register'); window.scrollTo(0,0); }} className="px-8 py-3 border border-white rounded-full font-semibold hover:bg-white hover:text-[#070B19] transition-all duration-300 text-sm tracking-wider text-white">
                GET STARTED
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>`;

if(content.includes('const [currentSlide, setCurrentSlide] = useState(0);')) {
  content = content.replace(searchHero, replaceHero);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Replaced successfully.");
} else {
  console.log("Could not find hero section to replace.");
}

