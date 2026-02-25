import React from 'react';

const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '' }) => {
  const baseStyle = "py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.02]";
  
  const variants = {
    primary: "bg-calm-primary hover:bg-cyan-700 text-white shadow-cyan-900/20",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-400 hover:text-calm-primary shadow-none"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;