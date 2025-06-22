import React from 'react';
import type { LanguageOption } from '../types';
import { Button } from './Button'; // Button will be restyled separately or use global styles
import { LoadingSpinner } from './LoadingSpinner';

interface ReviewFormProps {
  languages: LanguageOption[];
  selectedLanguage: LanguageOption;
  onLanguageChange: (language: LanguageOption) => void;
  repoUrl: string;
  onRepoUrlChange: (url: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  languages,
  selectedLanguage,
  onLanguageChange,
  repoUrl,
  onRepoUrlChange,
  onSubmit,
  isLoading,
}) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const langValue = event.target.value;
    const lang = languages.find(l => l.value === langValue) || languages[0];
    onLanguageChange(lang);
  };

  const isValidHttpUrl = (string: string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const canSubmit = !isLoading && repoUrl.trim() && isValidHttpUrl(repoUrl) && repoUrl.toLowerCase().includes('github.com');

  // Material Design uses slightly different visual cues for labels and inputs.
  // Inputs often have a line underneath or are outlined.
  // Using Tailwind classes that approximate Material Design's text field specs.
  // Global styles in index.css already provide some base styling for input/select.

  return (
    // Card styling with Material elevation (shadow-xl is a strong shadow)
    // Increased padding and spacing consistent with Material Design.
    <div className="bg-slate-800 p-6 md:p-8 rounded-lg shadow-xl space-y-8"> {/* Increased padding and spacing */}

      {/* Language Selection Field */}
      <div>
        <label htmlFor="language-select" className="block text-sm font-medium text-slate-300 mb-2"> {/* Adjusted label color and margin */}
          Primary Language of Repository
        </label>
        <select
          id="language-select"
          value={selectedLanguage.value}
          onChange={handleSelectChange}
          // Using global styles from index.css for select. Adding w-full.
          className="w-full p-3 text-slate-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
          disabled={isLoading}
          aria-label="Select primary language of the repository"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-slate-700"> {/* Ensure dropdown options are styled for dark mode */}
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Repository URL Input Field */}
      <div>
        <label htmlFor="repo-url-input" className="block text-sm font-medium text-slate-300 mb-2"> {/* Adjusted label color and margin */}
          GitHub Repository URL
        </label>
        <input
          type="url"
          id="repo-url-input"
          value={repoUrl}
          onChange={(e) => onRepoUrlChange(e.target.value)}
          placeholder="e.g., https://github.com/owner/repository-name"
          // Using global styles from index.css for input. Adding w-full.
          className="w-full p-3 font-mono text-sm text-slate-100 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out"
          disabled={isLoading}
          aria-label="GitHub Repository URL"
          aria-describedby="repo-url-hint"
        />
        <p id="repo-url-hint" className="mt-2 text-xs text-slate-400"> {/* Slightly increased margin-top */}
          Enter the full URL of a public GitHub repository.
        </p>
      </div>
      
      {/* Submit Button Area */}
      <div className="flex items-center justify-end pt-2"> {/* Added padding-top for separation */}
        <Button onClick={onSubmit} disabled={!canSubmit || isLoading} variant="primary">
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Reviewing Repo...</span>
            </>
          ) : (
            'Review Repository'
          )}
        </Button>
      </div>
    </div>
  );
};