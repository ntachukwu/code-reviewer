import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'text'; // Added 'text' variant
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  // Base styles are now mostly covered by global button styles in index.css
  // We only need to add variant-specific styles here and merge with any incoming className.
  
  const baseMaterialStyles = "font-medium tracking-wider uppercase focus:outline-none flex items-center justify-center space-x-2";
  // Note: Padding, border-radius, font-size, font-weight, transition are defined in src/index.css global button style

  const variantStyles = {
    primary: `bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`, // Material "contained" button
    secondary: `bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-500 focus:ring-2 focus:ring-slate-400 focus:ring-opacity-50`, // Material "outlined" like (custom dark theme)
    text: `bg-transparent hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 focus:ring-1 focus:ring-purple-500`, // Material "text" button
  };

  // Disabled styles are also handled globally in index.css for opacity and cursor.
  // We can add specific disabled styles per variant if needed, but Material often just reduces opacity.
  const disabledStateStyles = props.disabled ? "opacity-60 cursor-not-allowed" : "";


  return (
    <button
      // Merging base styles, variant styles, disabled styles, and any custom className passed to the component
      // Global button styles from index.css will apply first.
      className={`${baseMaterialStyles} ${variantStyles[variant]} ${disabledStateStyles} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};
