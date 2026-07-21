const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import AuthPage from './AuthPage';")) {
  content = content.replace("import FAQPage from './FAQPage';", "import FAQPage from './FAQPage';\nimport AuthPage from './AuthPage';");
}

content = content.replace(/if \(link\.name === 'FAQ'\) \{[\s\S]*?\} else if \(link\.name === 'Home'\) \{[\s\S]*?\}/g, 
  `if (link.name === 'FAQ') {
                    setCurrentPage('faq');
                    window.scrollTo(0,0);
                  } else if (link.name === 'Home') {
                    setCurrentPage('home');
                    window.scrollTo(0,0);
                  } else if (link.name === 'Login') {
                    setCurrentPage('login');
                    window.scrollTo(0,0);
                  } else if (link.name === 'Register') {
                    setCurrentPage('register');
                    window.scrollTo(0,0);
                  }`);

const appRegex = /\{currentPage === 'home' \? \([\s\S]*?\) : \(\n\s*<FAQPage \/>\n\s*\)\}/;

const appMatch = content.match(appRegex);
if (appMatch) {
    const newRender = `{currentPage === 'home' ? (
         <>
           <HeroSection />
           <StatsSection />
           <ExploreSolution />
           <AboutUs />
           <OurBoard />
           <CoreFeatures />
           <ProfitGraph />
           <InvestmentPlans />
           <ExploreMore />
         </>
       ) : currentPage === 'faq' ? (
         <FAQPage />
       ) : (
         <AuthPage initialMode={currentPage === 'register' ? 'register' : 'login'} setCurrentPage={setCurrentPage} />
       )}`;
    
    // Replace the exact matching conditional rendering with the new multi-page rendering
    content = content.replace(/\{currentPage === 'home' \? \([\s\S]*?\) : \(\n\s*<FAQPage \/>\n\s*\)\}/, newRender);
}

fs.writeFileSync('src/App.tsx', content);
