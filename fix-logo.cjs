const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newLogoCode = `
          <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer">
            <svg viewBox="0 0 100 100" className="w-8 h-8 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,15 C20,15 5,25 5,25 L10,33 C10,33 25,25 50,25 C75,25 90,33 90,33 L95,25 C95,25 80,15 50,15 Z M50,38 C35,38 25,41 25,41 L29,48 C29,48 40,46 50,46 C60,46 71,48 71,48 L75,41 C75,41 65,38 50,38 Z M43,50 L57,50 L53,90 L47,90 Z" />
            </svg>
            <span className="text-[#E53E3E] font-bold text-[22px] tracking-[0.25em] font-sans mt-1">TESLA</span>
          </div>
`;

content = content.replace(/<div className="flex-shrink-0 flex items-center gap-1 text-\[\#E53E3E\] font-bold text-xl tracking-widest cursor-pointer">\s*<span className="text-3xl text-white">T<\/span>ESLA\s*<\/div>/, newLogoCode.trim());

// Update Footer logo too
const footerLogoCode = `
            <div className="flex items-center gap-3 cursor-pointer mb-8">
              <svg viewBox="0 0 100 100" className="w-10 h-10 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,15 C20,15 5,25 5,25 L10,33 C10,33 25,25 50,25 C75,25 90,33 90,33 L95,25 C95,25 80,15 50,15 Z M50,38 C35,38 25,41 25,41 L29,48 C29,48 40,46 50,46 C60,46 71,48 71,48 L75,41 C75,41 65,38 50,38 Z M43,50 L57,50 L53,90 L47,90 Z" />
              </svg>
              <span className="text-[#E53E3E] font-bold text-3xl tracking-[0.25em] font-sans mt-1">TESLA</span>
            </div>
`;

content = content.replace(/<div className="flex items-center gap-1 text-\[\#E53E3E\] font-bold text-2xl tracking-widest mb-8">\s*<span className="text-4xl">T<\/span>ESLA\s*<\/div>/, footerLogoCode.trim());

fs.writeFileSync('src/App.tsx', content);
