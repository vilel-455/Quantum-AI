import React, { useState } from 'react';
import { ChevronDown, Send, ShieldCheck, Trophy, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const faqDataColumn1 = [
  { id: 1, question: "How can I participate?", answer: "To participate, simply click the 'Register' or 'Get Started' button, create an account, and follow the instructions to verify your identity and fund your account." },
  { id: 2, question: "What mode of payment are acceptable?", answer: "We accept a wide range of payment methods including bank transfers, major credit/debit cards, and popular cryptocurrencies like Bitcoin, Ethereum, and USDT." },
  { id: 3, question: "Is this legit or one of those scam projects out there?", answer: "We are a fully registered and regulated financial entity with over 10 years of experience. We employ top-tier security and have a transparent track record." },
  { id: 4, question: "How are the returns received?", answer: "Returns are automatically credited to your account dashboard, from where you can withdraw them directly to your designated bank account or crypto wallet." },
  { id: 5, question: "Are returns paid daily?", answer: "Depending on your selected investment plan, returns may be accrued daily, weekly, or at the end of the investment term." },
  { id: 6, question: "When does my investment start to yield earnings?", answer: "Your investment starts yielding earnings immediately after your deposit is confirmed and the funds are allocated to your chosen portfolio." },
  { id: 7, question: "Is there a minimum amount to withdraw my returns?", answer: "Yes, there is a nominal minimum withdrawal amount depending on the payment method chosen to cover transaction network fees." },
  { id: 8, question: "If i withdraw balance from my account, do i receive it in Bitcoins?", answer: "You can choose your preferred withdrawal method. If you select Bitcoin, your funds will be converted at the real-time market rate and sent to your wallet." },
  { id: 9, question: "What is compound interest?", answer: "Compound interest is the interest on a deposit calculated based on both the initial principal and the accumulated interest from previous periods." },
  { id: 10, question: "Are there risks involved?", answer: "We have been researching and developing our platform for a long time and although it is true that so far our results have been positive, operating in the crypto asset market involves a high level of risk. Although our committed team of experts and professionals work daily to obtain the best results, crypto assets and forex markets are always high risk markets. Whenever crypto assets are acquired, we must be aware of all the associated risks and keep in mind that high returns always imply taking higher risks and, of course, if anyone has any doubts, they should seek advice from an independent financial advisor." },
  { id: 11, question: "What security is implemented in the accounts that open in Quantum Ai Capital?", answer: "We utilize robust AES 256-bit encryption, cold storage for crypto assets, two-factor authentication (2FA), and continuous network monitoring to ensure maximum security." }
];

const faqDataColumn2 = [
  { id: 12, question: "By being a Quantum Ai Capital user, am i buying cryptocurrencies?", answer: "Not necessarily. Depending on the portfolio, you might be investing in derivatives or funds linked to crypto performance, without directly holding the underlying asset yourself." },
  { id: 13, question: "How does Quantum Ai Capital operate?", answer: "We pool capital from investors and our proprietary AI algorithms and expert analysts deploy these funds across diversified, high-yield markets to generate returns." },
  { id: 14, question: "Do you invest in Bitcoins?", answer: "Yes, a portion of our diversified portfolio includes Bitcoin and other high-cap cryptocurrencies, alongside traditional financial instruments." },
  { id: 15, question: "Does Quantum Ai Capital use blockchain technology?", answer: "Yes, we leverage blockchain technology for secure, transparent, and immutable record-keeping of transactions and smart contract execution." },
  { id: 16, question: "Can i recommend to my friends?", answer: "Absolutely. We have an affiliate program that rewards you for inviting friends and family to join our platform." },
  { id: 17, question: "Can i register directly with Quantum Ai Capital?", answer: "Yes, you can register directly on our website by providing your basic information and completing the verification process." },
  { id: 18, question: "What happens to my investment after the 30-day period?", answer: "Upon completion of your plan's duration, your initial principal and accumulated profits are transferred to your available balance, ready for withdrawal or reinvestment." },
  { id: 19, question: "Do i have to pay tax on the income obtained?", answer: "Tax regulations vary by jurisdiction. We advise consulting with a local tax professional regarding the declaration of your investment income." },
  { id: 20, question: "Is there any other type of commission charged?", answer: "We maintain a transparent fee structure with no hidden charges. Any applicable deposit or withdrawal fees are clearly stated before the transaction is executed." },
  { id: 21, question: "Do you have an App for Android or iPhone?", answer: "No, Tesla Investment & Stocks is adapted to access with any mobile device but no specific App for Android or iPhone has been developed yet. Any App that is advertised from the iPhone or Android stores does not belong to Tesla Investment & Stocks and therefore will not allow trading profits with Tesla Investment & Stocks accounts." }
];

const FAQItem = ({ faq, isOpen, toggleOpen }: { faq: any; isOpen: boolean; toggleOpen: () => void }) => {
  return (
    <div className="bg-[#F7FAFC] border border-gray-100 mb-2">
      <button 
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-gray-100 transition-colors"
      >
        <span className="text-[#2D3748] font-medium text-sm md:text-base">{faq.id}. {faq.question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="p-4 pt-0 text-sm text-gray-500 leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
};


export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for your inquiry. We will get back to you shortly.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <div className="relative bg-[#1A365D] py-24 border-b border-gray-700">
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        {/* Placeholder for background image */}
        <div 
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')" }}
        ></div>
        <div className="container relative z-10 mx-auto px-6 lg:px-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-widest font-serif">
            F.A.Q
          </h1>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-16">
          <p className="text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3">KNOWLEDGE BASE</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2D3748] font-serif">Search our articles or browse by category below</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
          <div>
            {faqDataColumn1.map((faq) => (
              <FAQItem 
                key={faq.id} 
                faq={faq} 
                isOpen={openId === faq.id} 
                toggleOpen={() => toggleAccordion(faq.id)} 
              />
            ))}
          </div>
          <div>
            {faqDataColumn2.map((faq) => (
              <FAQItem 
                key={faq.id} 
                faq={faq} 
                isOpen={openId === faq.id} 
                toggleOpen={() => toggleAccordion(faq.id)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info & Quote Section */}
      <div className="bg-[#1A365D] text-white py-24">
        <div className="container mx-auto px-6 lg:px-12 text-center mb-16">
          <p className="text-gray-300 font-bold uppercase text-[14px] tracking-[0.05em] mb-3">WE ARE THE BEST</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif max-w-4xl mx-auto leading-tight">
            Tesla Investment & Stocks has been giving best <span className="text-[#E53E3E] underline decoration-[#E53E3E]/50 underline-offset-8">consultation</span> to top Finance companies since 2012
          </h2>
        </div>

        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Excellence Record */}
          <div className="bg-white text-[#2D3748] p-8 md:p-12 shadow-xl">
            <h3 className="text-3xl font-bold font-serif mb-4">Excellence Record</h3>
            <p className="text-gray-500 mb-10 leading-relaxed text-sm md:text-base">
              From banking and insurance to wealth the management and security on distribution financial
            </p>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 flex-shrink-0 text-[#3182CE]">
                  <ShieldCheck className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">10+ Years In Business</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We are experienced in what we do and are guaranteed to give the best
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 flex-shrink-0 text-[#3182CE]">
                  <Trophy className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">5,000,000+ Happy Investors</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Based on past feedback from investors, we can beat our chest that we are one of the best in the industry
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 flex-shrink-0 text-[#3182CE]">
                  <Headset className="w-full h-full" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">24/7 Customer Support</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We are experienced in what we do and are guaranteed to give the best
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Get Free Quote */}
          <div className="bg-[#F7FAFC] text-[#2D3748] p-8 md:p-12 shadow-xl border border-gray-100">
            <h3 className="text-3xl font-bold font-serif mb-4">Get Free Quote</h3>
            <p className="text-gray-500 mb-8 leading-relaxed text-sm md:text-base">
              From banking and insurance to wealth the management and securitie on distribution financial
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  placeholder="Your Name *" 
                  required
                  className="w-full p-4 bg-white border border-gray-200 focus:outline-none focus:border-[#3182CE] transition-colors"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleFormChange} 
                  placeholder="Your Email *" 
                  required
                  className="w-full p-4 bg-white border border-gray-200 focus:outline-none focus:border-[#3182CE] transition-colors"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleFormChange} 
                  placeholder="Subject" 
                  className="w-full p-4 bg-white border border-gray-200 focus:outline-none focus:border-[#3182CE] transition-colors"
                />
              </div>
              <div>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleFormChange} 
                  placeholder="Message" 
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-200 focus:outline-none focus:border-[#3182CE] transition-colors resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="bg-[#E53E3E] text-white font-bold py-4 px-8 flex items-center justify-center gap-2 hover:bg-[#E25C5C] transition-colors w-full sm:w-auto"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
