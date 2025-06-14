
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-slate-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 md:px-8 md:py-6">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
          {title}
        </h1>
      </div>
    </header>
  );
};
