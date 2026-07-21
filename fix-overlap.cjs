const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix board overlap
content = content.replace(/className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto"/, 'className="grid md:grid-cols-3 gap-y-16 md:gap-12 max-w-5xl mx-auto"');

// Fix AboutUs mobile overlap if it exists
content = content.replace(/gap-20 items-center/, 'gap-16 md:gap-20 items-center');

// The instruction mentioned labels:
// Accent Labels: Small, capitalized text tags placed directly above main headings
// Label Styling: Secondary Red or Tertiary Blue color, set to bold uppercase, with a smaller font size (font-size: 0.875rem / 14px) and slightly increased letter-spacing (letter-spacing: 0.05em;) for a clean, professional hierarchy.
// Let's make sure all uppercase text tags match this.
content = content.replace(/text-\[\#E53E3E\] font-bold tracking-widest uppercase text-xs mb-3/g, 'text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3');
content = content.replace(/text-xs font-bold tracking-widest text-blue-400 uppercase/g, 'text-[#3182CE] font-bold uppercase text-[14px] tracking-[0.05em]');
content = content.replace(/text-\[\#E53E3E\] font-bold tracking-widest uppercase text-\[14px\] tracking-\[0.05em\] mb-3/g, 'text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3');
content = content.replace(/text-\[\#E53E3E\] font-bold tracking-widest uppercase text-\[14px\] mb-3/g, 'text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3');
content = content.replace(/text-xs mb-3/g, 'text-[14px] tracking-[0.05em] mb-3');

fs.writeFileSync('src/App.tsx', content);
