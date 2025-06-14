import React from 'react';
import type { LanguageOption } from '../types';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';

interface ReviewFormProps {
  languages: LanguageOption[];
  selectedLanguage: LanguageOption;
  onLanguageChange: (language: LanguageOption) => void;
  repoUrl: string; // Changed from 'code' to 'repoUrl'
  onRepoUrlChange: (url: string) => void; // Changed from 'onCodeChange'
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


  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl space-y-6">
      <div>
        <label htmlFor="language-select" className="block text-sm font-medium text-sky-300 mb-1">
          Select Primary Language of Repository
        </label>
        <select
          id="language-select"
          value={selectedLanguage.value}
          onChange={handleSelectChange}
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
          disabled={isLoading}
          aria-label="Select primary language of the repository"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="repo-url-input" className="block text-sm font-medium text-sky-300 mb-1">
          GitHub Repository URL
        </label>
        <input
          type="url"
          id="repo-url-input"
          value={repoUrl}
          onChange={(e) => onRepoUrlChange(e.target.value)}
          placeholder="e.g., https://github.com/owner/repository-name"
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 font-mono text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
          disabled={isLoading}
          aria-label="GitHub Repository URL"
          aria-describedby="repo-url-hint"
        />
        <p id="repo-url-hint" className="mt-1 text-xs text-slate-400">
          Enter the full URL of a public GitHub repository.
        </p>
      </div>
      
      <div className="flex items-center justify-end space-x-4">
        <Button onClick={onSubmit} disabled={!canSubmit} variant="primary">
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