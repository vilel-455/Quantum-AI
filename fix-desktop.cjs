const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const search = `    <div id="home" className="relative flex flex-col lg:min-h-screen justify-between pt-20 bg-white">
      <div className="absolute inset-x-0 top-0 h-[65vh] lg:h-auto lg:inset-0 overflow-hidden z-0">
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
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 h-[calc(65vh-80px)] lg:h-auto lg:flex-grow flex flex-col justify-center py-10 lg:py-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -80 }} transition={{ duration: 0.5 }}>
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
      </div>
      
      {/* Cards at the bottom */}
      <div className="w-full z-20 pointer-events-none pb-10 pt-6 lg:pt-0 lg:pb-12">
        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pointer-events-auto">
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
              className="bg-[#788496] lg:bg-[#081225]/90 backdrop-blur-sm h-36 lg:h-[140px] py-6 px-6 lg:px-8 flex flex-col justify-between hover:bg-[#E53E3E] transition-colors duration-300 cursor-pointer text-white shadow-none lg:shadow-xl"
            >
              <div>
                <item.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white/90" strokeWidth={1.2} />
              </div>
              <span className="font-semibold text-base lg:text-lg font-serif leading-tight">{item.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>`;

const replace = `    <div id="home" className="relative flex flex-col lg:min-h-screen justify-between pt-20 bg-white lg:bg-transparent">
      {/* On mobile: fixed height 65vh top image. On desktop: standard inset-0 overlaying the whole section */}
      <div className="absolute inset-x-0 top-0 h-[65vh] lg:h-auto lg:bottom-0 overflow-hidden z-0">
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
      
      <div className="relative z-10 container mx-auto px-6 lg:px-12 h-[calc(65vh-80px)] lg:h-auto lg:flex-grow flex flex-col justify-center py-10 lg:py-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -80 }} transition={{ duration: 0.5 }}>
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
      </div>
      
      {/* Cards at the bottom */}
      <div className="w-full z-20 pointer-events-none pb-10 pt-6 lg:pt-0">
        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 pointer-events-auto">
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
              className="bg-[#788496] lg:bg-[#081225]/90 backdrop-blur-sm h-36 lg:h-[140px] py-6 px-6 lg:px-8 flex flex-col justify-between hover:bg-[#E53E3E] transition-colors duration-300 cursor-pointer text-white shadow-none lg:shadow-xl"
            >
              <div>
                <item.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white/90" strokeWidth={1.2} />
              </div>
              <span className="font-semibold text-base lg:text-lg font-serif leading-tight">{item.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>`;

content = content.replace(search, replace);
fs.writeFileSync('src/App.tsx', content);
