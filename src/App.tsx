import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { ensureAuthRecords } from "./lib/auth-records";
import FAQPage from "./FAQPage";
import AuthPage from "./AuthPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminRouter } from "./components/admin/AdminRouter";
import { KycPage } from "./components/dashboard/KycPage";

import { motion, AnimatePresence } from "motion/react";
import {
  Menu,
  X,
  TrendingUp,
  ScrollText,
  Bitcoin,
  Building,
  ChevronDown,
  ChevronUp,
  CreditCard,
  ShieldCheck,
  Scale,
  Smartphone,
  Globe,
  LineChart as LineChartIcon,
  Shield,
  Zap,
  Trophy,
  Users,
  Headset,
  Check,
  Send,
  ArrowRight,
  BarChart2,
  FileText,
  CircleDollarSign,
} from "lucide-react";
import muskBitcoin from "./assets/images/musk_bitcoin_1783365587608.jpg";
import muskTesla from "./assets/images/musk_tesla_1783365605166.jpg";
import stockChart from "./assets/images/stock_chart_1783365621951.jpg";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const slides = [
  {
    image: muskBitcoin,
    subtitle: "Giving future to your investment",
    title: "A new Approach to Trading",
  },
  {
    image: muskTesla,
    subtitle: "Unlock your potential",
    title: "Maximize Your Returns",
  },
  {
    image: stockChart,
    subtitle: "Secure and Reliable",
    title: "Trust in Every Trade",
  },
];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const Navbar = ({
  currentPage,
  setCurrentPage,
}: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home", section: "home" },
    { name: "About", href: "#about", section: "about" },
    { name: "FAQ", href: "#", section: "faq" },
    { name: "Plans", href: "#plans", section: "plans" },
    { name: "Contact", href: "#contact", section: "contact" },
    { name: "Login", href: "#", section: "login" },
    { name: "Register", href: "#", section: "register" },
  ];

  return (
    <nav className="absolute top-0 w-full z-50 bg-[#070B19]/60 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setCurrentPage("home");
              window.scrollTo(0, 0);
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-8 h-8 text-white fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M50,15 C20,15 5,25 5,25 L10,33 C10,33 25,25 50,25 C75,25 90,33 90,33 L95,25 C95,25 80,15 50,15 Z M50,38 C35,38 25,41 25,41 L29,48 C29,48 40,46 50,46 C60,46 71,48 71,48 L75,41 C75,41 65,38 50,38 Z M43,50 L57,50 L53,90 L47,90 Z" />
            </svg>
            <span className="text-[#E53E3E] font-bold text-[22px] tracking-[0.25em] font-sans mt-1">
              TESLA
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  if (link.name === "FAQ") {
                    e.preventDefault();
                    setCurrentPage("faq");
                    window.scrollTo(0, 0);
                  } else if (link.name === "Login") {
                    e.preventDefault();
                    setCurrentPage("login");
                    window.scrollTo(0, 0);
                  } else if (link.name === "Register") {
                    e.preventDefault();
                    setCurrentPage("register");
                    window.scrollTo(0, 0);
                  } else {
                    if (currentPage !== "home") {
                      e.preventDefault();
                      setCurrentPage("home");
                      setTimeout(() => {
                        const el = document.getElementById(link.section);
                        if (el) {
                          const y =
                            el.getBoundingClientRect().top + window.scrollY;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }, 300);
                    } else {
                      e.preventDefault();
                      const el = document.getElementById(link.section);
                      if (el) {
                        const y =
                          el.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }
                  }
                }}
                className="text-white font-bold text-[13px] tracking-wide hover:text-gray-300 transition-colors duration-300"
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
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1A365D] border-b border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="block text-white font-semibold text-base hover:text-[#E53E3E] transition-colors duration-300"
                  onClick={(e) => {
                    if (link.name === "FAQ") {
                      e.preventDefault();
                      setCurrentPage("faq");
                      window.scrollTo(0, 0);
                    } else if (link.name === "Login") {
                      e.preventDefault();
                      setCurrentPage("login");
                      setIsOpen(false);
                      window.scrollTo(0, 0);
                    } else if (link.name === "Register") {
                      e.preventDefault();
                      setCurrentPage("register");
                      setIsOpen(false);
                      window.scrollTo(0, 0);
                    } else {
                      if (currentPage !== "home") {
                        e.preventDefault();
                        setCurrentPage("home");
                        setIsOpen(false);
                        setTimeout(() => {
                          const el = document.getElementById(link.section);
                          if (el) {
                            const y =
                              el.getBoundingClientRect().top + window.scrollY;
                            window.scrollTo({ top: y, behavior: "smooth" });
                          }
                        }, 300);
                      } else {
                        e.preventDefault();
                        setIsOpen(false);
                        const el = document.getElementById(link.section);
                        if (el) {
                          const y =
                            el.getBoundingClientRect().top + window.scrollY;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }
                    }
                  }}
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

const HeroSection = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 15000); // 15s delay
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="home"
      className="relative flex flex-col lg:min-h-screen justify-between pt-20 bg-white lg:bg-transparent"
    >
      {/* On mobile: fixed height 65vh top image. On desktop: standard inset-0 overlaying the whole section */}
      <div className="absolute inset-x-0 top-0 h-[65vh] lg:h-auto lg:bottom-0 overflow-hidden z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ x: "100%", scale: 1 }}
            animate={{ x: 0, scale: 1.1 }}
            exit={{ x: "-100%", scale: 1.1 }}
            transition={{
              x: { type: "tween", duration: 1, ease: "easeInOut" },
              scale: { duration: 15, ease: "linear" },
            }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${slides[currentSlide].image}')` }}
          />
        </AnimatePresence>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B19]/90 via-[#070B19]/60 to-black/40" />
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 h-[calc(65vh-80px)] lg:h-auto lg:flex-grow flex flex-col justify-center py-10 lg:py-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs lg:text-sm font-semibold tracking-wider uppercase mb-4 text-white">
              {slides[currentSlide].subtitle}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium mb-10 max-w-2xl leading-tight font-serif text-white">
              {slides[currentSlide].title}
            </h1>
            <div className="pointer-events-auto w-fit">
              <button
                onClick={() => {
                  setCurrentPage("register");
                  window.scrollTo(0, 0);
                }}
                className="px-8 py-3 border border-white rounded-full font-semibold hover:bg-white hover:text-[#070B19] transition-all duration-300 text-sm tracking-wider text-white"
              >
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
            { title: "Stocks", icon: BarChart2 },
            { title: "Bonds and ETFs", icon: FileText },
            { title: "Crypto", icon: CircleDollarSign },
            { title: "Real Estate Investing", icon: Building },
          ].map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              key={i}
              className="bg-[#788496] lg:bg-[#081225]/90 backdrop-blur-sm h-36 lg:h-[140px] py-6 px-6 lg:px-8 flex flex-col justify-between hover:bg-[#E53E3E] transition-colors duration-300 cursor-pointer text-white shadow-none lg:shadow-xl"
            >
              <div>
                <item.icon
                  className="w-8 h-8 lg:w-10 lg:h-10 text-white/90"
                  strokeWidth={1.2}
                />
              </div>
              <span className="font-semibold text-base lg:text-lg font-serif leading-tight">
                {item.title}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ExploreSolution = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="container mx-auto px-6 lg:px-12 pt-20 lg:pt-32 pb-24"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-4 text-[#1A365D] font-serif">
            Explore Solution
          </h2>
          <p className="text-gray-600 max-w-2xl text-lg">
            From banking and insurance to wealth management and securities
            distribution, we dedicated financial services the teams serve all
            major sectors.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentPage("register");
            window.scrollTo(0, 0);
          }}
          className="bg-[#E53E3E] hover:bg-[#E25C5C] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-[#E53E3E]/30"
        >
          Get Started
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            img: "https://images.unsplash.com/photo-1590283603385-18ff388220af?auto=format&fit=crop&q=80",
            text: "Want more out of your Stock trading?",
          },
          {
            img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80",
            text: "High-tech solutions meet Instant execution",
          },
          {
            img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80",
            text: "One of the world's most trusted brokers",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="relative group shadow-xl rounded-lg bg-white p-2 pb-16"
          >
            <div className="overflow-hidden rounded bg-gray-100">
              <img
                src={item.img}
                alt={item.text}
                className="w-full h-56 object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 text-center font-bold text-[#2D3748] bg-white">
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const AboutUs = () => {
  const [openAccordion, setOpenAccordion] = useState(0);

  const faqs = [
    {
      title: "Trading guides",
      content: (
        <div className="text-gray-600 text-sm space-y-4">
          <p>
            From technical analysis and risk management to market psychology and
            MT4 Tips and Tricks, these guides are ideal for traders of all
            levels.
          </p>
          <p>
            Our platform charges 21% of your total account balance for the
            following:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-500">
            <li>Account management</li>
            <li>Signal Fee for Trades conducted</li>
            <li>Insurance Policy Fee</li>
            <li>Account Investment Certificate</li>
            <li>Value added Tax (VAT)</li>
          </ul>
          <p>This fee must be paid before withdrawal can be approved.</p>
        </div>
      ),
    },
    {
      title: "Daily market commentary",
      content: (
        <p className="text-gray-600 text-sm">
          Stay updated with our daily insights into market trends and
          significant financial events.
        </p>
      ),
    },
    {
      title: "Breaking news & analysis",
      content: (
        <p className="text-gray-600 text-sm">
          Get real-time alerts and deep-dive analysis into breaking news
          affecting global markets.
        </p>
      ),
    },
  ];

  return (
    <div id="about" className="bg-[#F7FAFC] py-24 border-t border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 md:gap-20 items-center"
      >
        <div className="relative mt-8 lg:mt-0 max-w-md mx-auto lg:mx-0 w-full">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"
            alt="Speaker"
            className="w-full rounded-lg shadow-2xl object-cover aspect-[4/5]"
          />
          <div className="absolute -bottom-8 -left-4 lg:-left-12 bg-white p-6 shadow-2xl border border-gray-100 rounded-lg max-w-[300px]">
            <p className="font-bold text-[#1A365D] text-lg leading-snug">
              Successfully Providing Business Solution from 10 years
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3">
            About Us
          </h3>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1A365D] mb-6 font-serif">
            Learn A Little About Us
          </h2>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg">
            Quantum Ai Capital is a leading financial services company and
            pioneer in the online brokerage industry. Having executed the
            first-ever electronic trade by an individual investor more than 10
            years ago.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-transparent border-b border-gray-200 overflow-hidden"
              >
                <button
                  className="w-full flex justify-between items-center py-4 font-bold text-[#1A365D] hover:text-[#E53E3E] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-left"
                  onClick={() => setOpenAccordion(openAccordion === i ? -1 : i)}
                >
                  {faq.title}
                  {openAccordion === i ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {openAccordion === i && (
                  <div className="pb-6 pt-2">{faq.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const OurBoard = () => {
  const board = [
    {
      name: "Jared Birchall - Manager",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80",
    },
    {
      name: "Robyn Denholm - Board Chairman",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80",
    },
    {
      name: "Elon Musk - CEO",
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="py-24 container mx-auto px-6 lg:px-12 bg-white"
    >
      <h2 className="text-4xl lg:text-5xl font-bold text-center text-[#1A365D] mb-20 font-serif">
        Our Board
      </h2>
      <div className="grid md:grid-cols-3 gap-y-16 md:gap-12 max-w-5xl mx-auto">
        {board.map((member, i) => (
          <div key={i} className="relative flex flex-col items-center">
            <img
              src={member.img}
              alt={member.name}
              className="w-full aspect-square object-cover rounded shadow-lg bg-gray-100"
            />
            <div className="absolute -bottom-6 w-11/12 bg-white shadow-xl py-5 px-4 text-center rounded border border-gray-50">
              <p className="font-bold text-[#2D3748]">{member.name}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const CoreFeatures = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  const features = [
    { title: "Payment Options", icon: CreditCard },
    { title: "Strong Security", icon: ShieldCheck },
    { title: "Legal Compliance", icon: Scale },
    { title: "Cross Platform", icon: Smartphone },
    { title: "World Coverage", icon: Globe },
    { title: "Advanced Reporting", icon: LineChartIcon },
  ];

  return (
    <div className="bg-gray-100 py-32 mt-16">
      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h3 className="text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3">
            Core Features
          </h3>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1A365D] mb-6 leading-tight font-serif">
            Why we are above others
          </h2>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg">
            Your Stock broker will hold your funds. Thus, it is important you
            verify it is safe. Stock Birds easily circumvents this concern as we
            are registered with and duly regulated by the European Securities
            and Investments Commission. Consequently, you can be sure that we
            will always keep you and your funds safe. Our work draws on more
            than 10 years of experience. They are delivered by over 5,000
            professionals in the world's most important financial centers.
          </p>
          <button
            onClick={() => {
              setCurrentPage("register");
              window.scrollTo(0, 0);
            }}
            className="bg-[#3182CE] hover:bg-[#2B6CB0] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-[#3182CE]/30"
          >
            Get Started
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow flex flex-col items-center text-center"
            >
              <feat.icon
                className="w-12 h-12 text-[#1A365D] mb-6"
                strokeWidth={1.5}
              />
              <span className="font-bold text-[#1A365D] text-sm">
                {feat.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfitGraphSection = () => {
  const data = [
    { year: "2015", val1: 3, val2: 5 },
    { year: "2016", val1: 4, val2: 6 },
    { year: "2017", val1: 6, val2: 5 },
    { year: "2018", val1: 8, val2: 7 },
    { year: "2019", val1: 7, val2: 9 },
    { year: "2020", val1: 9, val2: 8 },
  ];

  return (
    <div className="py-32 container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center bg-white">
      <div>
        <h3 className="text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3">
          Profit Graph
        </h3>
        <h2 className="text-4xl lg:text-5xl font-bold text-[#1A365D] mb-10 leading-tight font-serif">
          Quantum Ai Capital gives you the best Financial solution.
        </h2>

        <div className="space-y-8 mb-10">
          <div className="flex gap-6 items-start">
            <div className="p-4 bg-white border border-gray-100 shadow-sm text-[#1A365D] rounded-full shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#1A365D] mb-2 text-lg">
                Security:
              </h4>
              <p className="text-gray-600">
                we offer protection when your customers have financial.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="p-4 bg-white border border-gray-100 shadow-sm text-[#E53E3E] rounded-full shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#1A365D] mb-2 text-lg">
                Flexibility:
              </h4>
              <p className="text-gray-600">
                we offer protection when your customers have financial.
              </p>
            </div>
          </div>
        </div>

        <button className="bg-[#3182CE] hover:bg-[#2B6CB0] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-[#3182CE]/30">
          Contact Us
        </button>
      </div>

      <div className="bg-[#F7FAFC]/80 p-8 rounded-2xl border border-gray-100">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                cursor={{ stroke: "#e5e7eb", strokeWidth: 2 }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="val1"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="val2"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-[#1A365D]">Annual Report:</span>{" "}
            From 2012 to 2020 the growth rate grew
          </p>
          <p className="font-bold text-green-500 mt-2">+29,999.40%</p>
        </div>
      </div>
    </div>
  );
};

const Consultation = () => {
  return (
    <div id="contact" className="relative bg-[#1A365D] text-white py-32">
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply" />

      <div className="relative z-10 container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <p className="text-[#3182CE] font-bold uppercase text-[14px] tracking-[0.05em] mb-4">
            We are the best
          </p>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight max-w-4xl mx-auto font-serif">
            Tesla Investment & Stocks has been giving best{" "}
            <span className="text-[#E53E3E] underline decoration-red-500/30 underline-offset-8">
              consultation
            </span>{" "}
            to top Finance companies since 2012
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Excellence Record */}
          <div className="bg-white text-[#2D3748] p-10 rounded-xl shadow-2xl">
            <h3 className="text-3xl font-bold mb-4 font-serif">
              Excellence Record
            </h3>
            <p className="text-gray-600 mb-10 text-lg">
              From banking and insurance to wealth the management and security
              on distribution financial
            </p>

            <div className="space-y-8">
              {[
                {
                  icon: Trophy,
                  title: "10+ Years In Business",
                  desc: "We are experienced in what we do and are guaranteed to give the best",
                },
                {
                  icon: Users,
                  title: "5,000,000+ Happy Investors",
                  desc: "Based on past feedback from investors, we can beat our chest that we are one of the best in the industry",
                },
                {
                  icon: Headset,
                  title: "24/7 Customer Support",
                  desc: "We are experienced in what we do and are guaranteed to give the best",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="text-[#1A365D] shrink-0 mt-1">
                    <item.icon className="w-10 h-10" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-xl">{item.title}</h4>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Get Free Quote */}
          <div className="bg-[#F7FAFC] text-[#2D3748] p-10 rounded-xl shadow-2xl flex flex-col">
            <h3 className="text-3xl font-bold mb-4 font-serif">
              Get Free Quote
            </h3>
            <p className="text-gray-600 mb-10 text-lg">
              From banking and insurance to wealth the management and securitie
              on distribution financial
            </p>
            <div className="flex-grow border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-white/50 min-h-[300px]">
              <div className="text-center p-6">
                <p className="font-semibold text-gray-500 mb-2">
                  Quote Request Form
                </p>
                <p className="text-sm">
                  Interactive form placeholder to match design layout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvestmentPlans = () => {
  const plans = [
    { name: "Basic", min: "$200", max: "$4,999", duration: "24 Hours" },
    { name: "Silver", min: "$5,000", max: "$9,999", duration: "72 Hours" },
    { name: "Gold", min: "$10,000", max: "$49,999", duration: "7 Days" },
    { name: "Platinum", min: "$50,000", max: "$100,000", duration: "14 Days" },
  ];

  return (
    <div id="plans" className="py-32 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <p className="text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3">
            Plans
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1A365D] font-serif">
            Our Investment Plans
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col h-full"
            >
              <h3 className="text-3xl font-bold text-center mb-10 font-serif">
                {plan.name}
              </h3>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  `Min: ${plan.min}`,
                  `Max: ${plan.max}`,
                  `Duration: ${plan.duration}`,
                  "Referral Bonus",
                  "Multiple Investments Allowed",
                  "24/7 Customer Care",
                ].map((feature, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setCurrentPage("login");
                  window.scrollTo(0, 0);
                }}
                className="w-full py-3 border border-[#E53E3E] text-[#E53E3E] rounded-full font-bold hover:bg-[#E53E3E] hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Login to Invest
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ExploreMore = ({
  setCurrentPage,
}: {
  setCurrentPage: (page: string) => void;
}) => {
  const items = [
    {
      img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80",
      title: "Excellence Record",
      desc: "Your Stock broker will hold your funds. Thus, it is important you verify it is safe. Stock Birds easily circumvents this concern as we are registered with and duly regulated by the US's Securities and Exchange Commission (SEC). Consequently, you can be sure",
    },
    {
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80",
      title: "We Genuinely Want Our Clients to Succeed",
      desc: "Genuinely, we want to see you succeed. Once you open an account with us, we will hold your capital in trust. We will work with you until you succeed. Our platforms are responsive, our execution speed is fast, the markets we cover are broad, and we give you",
    },
    {
      img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80",
      title: "We Are A Broker of Established Repute",
      desc: "Our reputation has been confirmed. We have been around for long and about us our clients from all over the world have nothing but positive things to say. We offer only a market-leading, industry-standard brokerage service, and we know you would not want to deny yourself of it. Stock broker",
    },
  ];

  return (
    <div className="py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <p className="text-[#E53E3E] font-bold uppercase text-[14px] tracking-[0.05em] mb-3">
            We are here for you
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1A365D] font-serif">
            Explore More
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-[#F7FAFC] rounded-xl overflow-hidden flex flex-col group hover:shadow-xl transition duration-300"
            >
              <div className="overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-4 text-[#1A365D]">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
                  {item.desc}
                </p>
                <button
                  onClick={() => {
                    setCurrentPage("register");
                    window.scrollTo(0, 0);
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#3182CE] transition-all duration-300 transform hover:scale-105 active:scale-95 origin-left uppercase tracking-widest"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#1A365D] text-gray-300 pt-20 pb-8">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-16 mb-16 pb-16 border-b border-gray-700/50">
          <div>
            <div className="flex items-center gap-3 cursor-pointer mb-8">
              <svg
                viewBox="0 0 100 100"
                className="w-10 h-10 text-white fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M50,15 C20,15 5,25 5,25 L10,33 C10,33 25,25 50,25 C75,25 90,33 90,33 L95,25 C95,25 80,15 50,15 Z M50,38 C35,38 25,41 25,41 L29,48 C29,48 40,46 50,46 C60,46 71,48 71,48 L75,41 C75,41 65,38 50,38 Z M43,50 L57,50 L53,90 L47,90 Z" />
              </svg>
              <span className="text-[#E53E3E] font-bold text-3xl tracking-[0.25em] font-sans mt-1">
                TESLA
              </span>
            </div>
            <p className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition cursor-pointer">
              <span>Email:</span> support@quantumaicapital.com
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xl mb-8">Our Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Plans
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xl mb-8">
              Subscribe Newsletter
            </h4>
            <div className="flex bg-[#1e2336] border border-gray-700/50 rounded overflow-hidden mb-6">
              <input
                type="email"
                placeholder="Enter your email..."
                className="bg-transparent px-5 py-4 w-full text-sm outline-none placeholder-gray-500 text-white"
              />
              <button className="bg-[#E53E3E] hover:bg-[#E25C5C] px-6 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              Sign up for our latest news & articles. We won't give you spam
              mails.
            </p>
            <div className="flex items-center gap-4">
              <div className="bg-black text-white px-4 py-2 rounded text-2xl font-bold flex items-center gap-1 tracking-tighter">
                <span className="text-[#0ea5e9]">Hapton</span>
              </div>
              <p className="text-xs text-gray-500 max-w-[120px] leading-tight">
                Partnered By Hapton Credit Union
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 font-medium">
          © 2024, Quantum Ai Capital. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-[#E53E3E] text-white rounded-full shadow-2xl hover:bg-[#E25C5C] transition-all duration-300 z-50 transform hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          <ChevronUp className="w-6 h-6" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

function DashboardHomeContent({ onLogout }: { onLogout: () => void }) {
  return (
    <DashboardLayout initialActiveNav="dashboard" onLogout={onLogout}>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E53E3E]">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your account is now connected to the dashboard experience.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [session, setSession] = useState<any>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Logout failed", error);
      }
    } finally {
      setSession(null);
      setCurrentPage("login");
      setAuthError(null);
      try {
        window.localStorage.removeItem("sb-access-token");
        window.localStorage.removeItem("sb-refresh-token");
        window.localStorage.removeItem("sb-session");
      } catch {
        // ignore
      }
      try {
        window.sessionStorage.clear();
      } catch {
        // ignore
      }
      window.scrollTo(0, 0);
    }
  };

  // Keep forbidden public nav items hidden once authenticated.
  const isAuthenticated = Boolean(session);
  const isDashboardLikePage =
    currentPage === "dashboard" ||
    currentPage === "withdraw" ||
    currentPage === "kyc" ||
    currentPage === "logout";
  const isAuthPages = currentPage === "login" || currentPage === "register";

  // Admin pages (string-based navigation, no routing changes)
  const isAdminPage =
    currentPage === "admin_dashboard" ||
    currentPage === "admin_users" ||
    currentPage === "admin_deposits" ||
    currentPage === "admin_withdrawals" ||
    currentPage === "admin_transactions" ||
    currentPage === "admin_investment_plans" ||
    currentPage === "admin_kyc_requests" ||
    currentPage === "admin_support_tickets" ||
    currentPage === "admin_newsletter" ||
    currentPage === "admin_settings" ||
    currentPage === "admin_logout";

  const isPrivateUI = isDashboardLikePage || isAuthPages || isAdminPage;

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setAuthError(null);
      setIsAuthInitializing(true);

      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        setAuthError(error.message);
      } else {
        setSession(data.session);
      }

      setIsAuthInitializing(false);
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthInitializing) return;
    if (!session?.user) return;

    ensureAuthRecords(session.user).catch((err) => {
      console.error("Unable to verify auth records for restored session:", err);
      void supabase.auth.signOut();
      setSession(null);

      const isOnPrivatePage = isDashboardLikePage || isAdminPage;
      if (isOnPrivatePage) {
        setCurrentPage("login");
        window.scrollTo(0, 0);
      } else {
        setAuthError(null);
      }
    });
  }, [isAdminPage, isAuthInitializing, isDashboardLikePage, session]);

  useEffect(() => {
    if (isAuthInitializing) return;

    const isOnProtectedPage = currentPage === "dashboard";
    const isOnAdminPage =
      currentPage === "admin_dashboard" ||
      currentPage === "admin_users" ||
      currentPage === "admin_deposits" ||
      currentPage === "admin_withdrawals" ||
      currentPage === "admin_transactions" ||
      currentPage === "admin_investment_plans" ||
      currentPage === "admin_kyc_requests" ||
      currentPage === "admin_support_tickets" ||
      currentPage === "admin_newsletter" ||
      currentPage === "admin_settings" ||
      currentPage === "admin_logout";

    // Only redirect away from genuinely protected content when no session exists.
    if (!session && (isOnProtectedPage || isOnAdminPage)) {
      setCurrentPage("login");
      window.scrollTo(0, 0);
    }
  }, [currentPage, isAuthInitializing, session]);

  if (isAuthInitializing) {
    return (
      <div className="font-sans text-[#2D3748] bg-white">
        {/* Keep marketing navigation out of authenticated UI while session initializes */}
        {!isPrivateUI ? (
          <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        ) : null}
      </div>
    );
  }

  const isPublicLandingPage =
    currentPage === "home" ||
    currentPage === "about" ||
    currentPage === "plans" ||
    currentPage === "contact";

  return (
    <div className="font-sans text-[#2D3748] bg-white">
      {!isPrivateUI ? (
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      ) : null}
      {authError ? (
        <div className="p-6 text-sm text-red-600">{authError}</div>
      ) : null}

      {isPublicLandingPage ? (
        <>
          <HeroSection setCurrentPage={setCurrentPage} />
          <ExploreSolution setCurrentPage={setCurrentPage} />
          <AboutUs />
          <OurBoard />
          <CoreFeatures setCurrentPage={setCurrentPage} />
          <ProfitGraphSection />
          <Consultation />
          <InvestmentPlans />
          <ExploreMore setCurrentPage={setCurrentPage} />
        </>
      ) : currentPage === "faq" ? (
        <FAQPage />
      ) : isAuthPages ? (
        <AuthPage
          initialMode={currentPage === "register" ? "register" : "login"}
          setCurrentPage={setCurrentPage}
          setSession={setSession}
        />
      ) : currentPage === "dashboard" ? (
        <DashboardHomeContent onLogout={handleLogout} />
      ) : currentPage === "investment_plans" ? (
        // Authenticated dashboard investment workflow
        // (Landing page remains informational; investing is only available here)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        (() => {
          const mod = require("./components/dashboard/investment_plans");
          return <mod.InvestmentPlansView />;
        })()
      ) : currentPage === "kyc" ? (
        <KycPage onLogout={handleLogout} />
      ) : (
        // Admin pages are rendered below
        <AdminRouter
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          session={session}
        />
      )}

      {/* Landing footer only on public pages */}
      {isPublicLandingPage || currentPage === "faq" ? <Footer /> : null}
      <BackToTop />
    </div>
  );
}
