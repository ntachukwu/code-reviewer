import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    // Using Material Design elevation for shadow, and a common surface color.
    // Increased padding for a more spacious feel, typical in Material app bars.
    <header className="bg-slate-800 shadow-lg sticky top-0 z-50"> {/* bg-surface-dp02 or similar if using specific MD color vars */}
      <div className="container mx-auto px-6 py-5 md:px-10 md:py-5"> {/* Increased padding */}
        {/* Title styling: Using Roboto (via global styles), adjusted size and color for Material Design.
            text-2xl is approx 20sp, md:text-3xl is approx 24sp. Material guidelines suggest 20sp for titles in app bars.
            Using a less "loud" color, more in line with Material's standard text on dark surfaces.
        */}
        <h1 className="text-xl md:text-2xl font-medium text-slate-50"> {/* font-medium is Roboto 500 */}
          {title}
        </h1>
      </div>
    </header>
  );
};
