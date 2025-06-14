
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  const baseStyles = "px-6 py-3 rounded-md font-semibold text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center space-x-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg focus:ring-sky-500",
    secondary: "bg-slate-600 hover:bg-slate-500 text-slate-100 focus:ring-slate-500",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${props.disabled ? disabledStyles : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
