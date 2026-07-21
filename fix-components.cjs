const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<StatsSection \/>\n\s*<ExploreSolution \/>\n\s*<AboutUs \/>\n\s*<OurBoard \/>\n\s*<CoreFeatures \/>\n\s*<ProfitGraph \/>\n\s*<InvestmentPlans \/>\n\s*<ExploreMore \/>/,
  `<ExploreSolution />\n           <AboutUs />\n           <OurBoard />\n           <CoreFeatures />\n           <ProfitGraphSection />\n           <Consultation />\n           <InvestmentPlans />\n           <ExploreMore />`
);

fs.writeFileSync('src/App.tsx', content);
