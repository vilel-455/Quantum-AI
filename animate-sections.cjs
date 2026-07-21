const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. ExploreSolution
content = content.replace(
  /const ExploreSolution = \(\) => \{\n  return \(\n    <div className="container mx-auto px-6 lg:px-12 pt-\[220px\] sm:pt-40 md:pt-40 lg:pt-32 pb-24">/g,
  `const ExploreSolution = () => {\n  return (\n    <motion.div \n      initial={{ opacity: 0, y: 50 }}\n      whileInView={{ opacity: 1, y: 0 }}\n      viewport={{ once: true, margin: "-100px" }}\n      transition={{ duration: 0.6, ease: "easeOut" }}\n      className="container mx-auto px-6 lg:px-12 pt-[220px] sm:pt-40 md:pt-40 lg:pt-32 pb-24"\n    >`
);
// Fix the closing div for ExploreSolution
// It's the div before AboutUs
content = content.replace(
  /    <\/div>\n  \);\n\};\n\nconst AboutUs/g,
  `    </motion.div>\n  );\n};\n\nconst AboutUs`
);

// 2. AboutUs
content = content.replace(
  /const AboutUs = \(\) => \{([\s\S]*?)return \(\n    <div className="bg-\[\#F7FAFC\] py-24 border-t border-gray-100">\n      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 md:gap-20 items-center">/,
  `const AboutUs = () => {$1return (\n    <div className="bg-[#F7FAFC] py-24 border-t border-gray-100">\n      <motion.div \n        initial={{ opacity: 0, y: 50 }}\n        whileInView={{ opacity: 1, y: 0 }}\n        viewport={{ once: true, margin: "-100px" }}\n        transition={{ duration: 0.6, ease: "easeOut" }}\n        className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 md:gap-20 items-center"\n      >`
);
// Fix the closing div for the container in AboutUs
content = content.replace(
  /        <\/div>\n      <\/div>\n    <\/div>\n  \);\n\};\n\nconst OurBoard/g,
  `        </div>\n      </motion.div>\n    </div>\n  );\n};\n\nconst OurBoard`
);

// 3. OurBoard
content = content.replace(
  /const OurBoard = \(\) => \{([\s\S]*?)return \(\n    <div className="py-24 container mx-auto px-6 lg:px-12 bg-white">/,
  `const OurBoard = () => {$1return (\n    <motion.div \n      initial={{ opacity: 0, y: 50 }}\n      whileInView={{ opacity: 1, y: 0 }}\n      viewport={{ once: true, margin: "-100px" }}\n      transition={{ duration: 0.6, ease: "easeOut" }}\n      className="py-24 container mx-auto px-6 lg:px-12 bg-white"\n    >`
);
// Fix the closing div for OurBoard
content = content.replace(
  /      <\/div>\n    <\/div>\n  \);\n\};\n\nconst CoreFeatures/g,
  `      </div>\n    </motion.div>\n  );\n};\n\nconst CoreFeatures`
);

fs.writeFileSync('src/App.tsx', content);
