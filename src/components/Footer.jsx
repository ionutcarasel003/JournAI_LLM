import React from 'react';
import { Github, Globe, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                <Sparkles size={12} fill="currentColor"/>
              </div>
              <h4 className="font-bold text-gray-900 text-lg">Reflect</h4>
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Spațiul tău digital pentru claritate, echilibru și creștere interioară.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-gray-600">
            <button className="hover:text-indigo-600 transition-colors">Manifest</button>
            <button className="hover:text-indigo-600 transition-colors">Confidențialitate</button>
            <button className="hover:text-indigo-600 transition-colors">Ajutor</button>
          </div>

          <div className="flex gap-3">
            <SocialButton icon={Github} />
            <SocialButton icon={Globe} />
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Reflect App. Toate drepturile rezervate.</p>
          <p>Dezvoltat cu ❤️ pentru sănătatea mentală.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialButton = ({ icon: Icon }) => (
  <button className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
    <Icon size={18} />
  </button>
);

export default Footer;