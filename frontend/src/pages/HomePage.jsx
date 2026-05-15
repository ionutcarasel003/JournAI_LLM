import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun, Music, BookOpen, Video, Newspaper, 
  ChevronLeft, ChevronRight, Quote, Sparkles, ExternalLink,
  Wind, Target, Check, PlayCircle, PauseCircle
} from 'lucide-react';
import Card from '../components/Card';

const SLIDES = [
  {
    id: 1,
    title: "Welcome to Reflect",
    desc: "Your new space for mental clarity and inner balance.",
    bg: "from-indigo-500 to-purple-600"
  },
  {
    id: 2,
    title: "The 'Breathe' module is here",
    desc: "Try the guided breathing exercise below for instant calm.",
    bg: "from-teal-400 to-emerald-600"
  },
  {
    id: 3,
    title: "The science behind stillness",
    desc: "Find out how 5 minutes of journaling a day can positively rewire your brain.",
    bg: "from-orange-400 to-rose-500"
  }
];

const QUOTES = [
  "You don't have to control the storm, just calm your mind as it passes.",
  "Reflection is the mirror in which the soul sees its true face.",
  "Breath is the anchor that brings you back to the present.",
  "You are stronger than you think and braver than you feel.",
  "Peace comes from within. Do not seek it without.",
  "A bad day doesn't mean a bad life."
];

const RESOURCE_SETS = [
  {
    theme: "Relax & Calm",
    items: [
      { icon: Music, color: "blue", title: "Rain Sounds", type: "Audio", sub: "Ambient (3 hours)", link: "https://www.youtube.com/watch?v=mPZkdNFkNps" },
      { icon: BookOpen, color: "green", title: "How to stop time", type: "Book", sub: "Matt Haig", link: "https://books.google.ro/books?id=Matt+Haig" },
      { icon: Video, color: "purple", title: "4-7-8 Breathing", type: "Video", sub: "Guided Technique", link: "https://www.youtube.com/watch?v=UXw6507cbaU" },
      { icon: Newspaper, color: "orange", title: "Benefits of silence", type: "Article", sub: "5 min read", link: "https://www.reginamaria.ro/articole-medicale/beneficiile-sanatatii-mintale" }
    ]
  },
  {
    theme: "Motivation & Energy",
    items: [
      { icon: Music, color: "red", title: "Lofi Beats Work", type: "Audio", sub: "Focus Flow", link: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
      { icon: BookOpen, color: "blue", title: "Atomic Habits", type: "Book", sub: "James Clear", link: "https://www.google.ro/books/edition/Atomic_Habits/XfFvDwAAQBAJ" },
      { icon: Video, color: "orange", title: "TED: How to succeed", type: "Video", sub: "Inspirational", link: "https://www.youtube.com/watch?v=Lp7E973zozc" },
      { icon: Newspaper, color: "green", title: "Mental Organization", type: "Article", sub: "Productivity", link: "https://www.dor.ro/" }
    ]
  },
  {
    theme: "Sleep & Recovery",
    items: [
      { icon: Music, color: "purple", title: "Delta Frequencies", type: "Audio", sub: "Deep sleep", link: "https://www.youtube.com/watch?v=xQ6xgDI7Whc" },
      { icon: BookOpen, color: "blue", title: "Why we sleep", type: "Book", sub: "Matthew Walker", link: "https://books.google.ro/books/about/Why_We_Sleep.html" },
      { icon: Video, color: "blue", title: "Yoga for sleep", type: "Video", sub: "Light stretching", link: "https://www.youtube.com/watch?v=BiWDsfZ3zbo" },
      { icon: Newspaper, color: "red", title: "Sleep hygiene", type: "Article", sub: "Practical guide", link: "https://www.reginamaria.ro/articole-medicale/igiena-somnului" }
    ]
  }
];

const INTENTIONS = ["Peace", "Gratitude", "Energy", "Focus", "Healing"];

const HomePage = ({ user }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [selectedIntention, setSelectedIntention] = useState(null);

  const [isBreathing, setIsBreathing] = useState(false);
  const [breathText, setBreathText] = useState("Inhale");
  const [breathScale, setBreathScale] = useState(1); 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    let interval;
    if (isBreathing) {
      setBreathText("Inhale...");
      setBreathScale(1.5);
      
      interval = setInterval(() => {
        setBreathScale((prev) => {
          if (prev === 1) {
            setBreathText("Inhale...");
            return 1.5;
          } else {
            setBreathText("Exhale...");
            return 1;
          }
        });
      }, 4000); 
    } else {
      setBreathText("Start");
      setBreathScale(1);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  const { dailyQuote, dailyResources } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    return { 
      dailyQuote: QUOTES[dayOfYear % QUOTES.length], 
      dailyResources: RESOURCE_SETS[dayOfYear % RESOURCE_SETS.length] 
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hello, {user.email.split('@')[0]}</h1>
          <p className="text-gray-500">Welcome back to <span className="font-bold text-calm-primary">Reflect</span>.</p>
        </div>
           <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className={`relative rounded-[2rem] overflow-hidden shadow-2xl h-72 transition-all duration-1000 bg-gradient-to-br ${SLIDES[currentSlide].bg}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 p-10 h-full flex flex-col justify-center text-white max-w-3xl">
          <span className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold mb-4 backdrop-blur-md uppercase tracking-wide border border-white/20">
             Featured
          </span>
          <h2 className="text-4xl font-extrabold mb-3 leading-tight">
            {SLIDES[currentSlide].title}
          </h2>
          <p className="text-white/90 text-lg font-medium opacity-90 max-w-xl">
            {SLIDES[currentSlide].desc}
          </p>
        </div>

        <div className="absolute bottom-6 right-8 flex gap-3 z-20">
          <button onClick={prevSlide} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition border border-white/10"><ChevronLeft size={20} /></button>
          <button onClick={nextSlide} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition border border-white/10"><ChevronRight size={20} /></button>
        </div>
        
        <div className="absolute bottom-6 left-10 flex gap-2">
          {SLIDES.map((_, index) => (
            <div key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-500"></div>
          <div className="flex items-center gap-2 mb-6 w-full text-left">
             <div className="p-2 bg-teal-50 rounded-full text-teal-600"><Wind size={18}/></div>
             <h3 className="font-bold text-gray-700">Breathe</h3>
          </div>

          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
             <div className="absolute inset-0 bg-teal-50 rounded-full"></div>
             <div 
                className="absolute inset-0 bg-teal-100 rounded-full opacity-50 transition-transform duration-[4000ms] ease-in-out"
                style={{ transform: `scale(${breathScale})` }}
             ></div>
             
             <button 
                onClick={() => setIsBreathing(!isBreathing)}
                className="relative z-10 w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-teal-600 hover:scale-105 transition-transform"
             >
                {isBreathing ? <PauseCircle size={32} /> : <PlayCircle size={32} />}
             </button>
          </div>
          
          <p className="text-sm font-medium text-teal-800 transition-all duration-500">{isBreathing ? breathText : "Take a 1-minute break"}</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-full text-purple-600"><Target size={18}/></div>
                <h3 className="font-bold text-gray-700">Intention of the Day</h3>
             </div>
             {selectedIntention && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Check size={12}/> Set</span>}
          </div>

          <p className="text-sm text-gray-500 mb-4">What do you want to focus on today? Choose a word to guide you.</p>

          <div className="flex flex-wrap gap-3">
            {INTENTIONS.map((intent) => (
              <button
                key={intent}
                onClick={() => setSelectedIntention(intent)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border
                  ${selectedIntention === intent 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200 scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-none bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden shadow-xl">
        <Quote className="absolute right-6 top-6 text-white/10 w-32 h-32 rotate-12" />
        <div className="relative z-10 p-2">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Reflection</h3>
          </div>
          <p className="text-white italic text-2xl font-light leading-relaxed tracking-wide">
            "{dailyQuote}"
          </p>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                  Today's Collection
                  <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                   Theme: <span className="text-calm-primary font-bold">{dailyResources.theme}</span>
                </p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyResources.items.map((item, index) => (
                <ResourceCard 
                  key={index}
                  {...item}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

const ResourceCard = ({ icon: Icon, color, title, subtitle, type, link }) => {
  const colorClasses = {
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    red: "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
    green: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    orange: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
  };

  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-transparent hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group hover:-translate-y-1"
    >
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl transition-all duration-300 shadow-sm ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={24}/>
        </div>
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{type}</span>
          <h4 className="text-gray-800 font-bold text-lg leading-tight group-hover:text-calm-primary transition-colors">{title}</h4>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-calm-primary group-hover:text-white transition-colors">
         <ExternalLink size={14} />
      </div>
    </a>
  );
};

export default HomePage;