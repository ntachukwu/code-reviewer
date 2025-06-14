import React, { useState, useCallback } from 'react'
import { Header } from './components/Header';
import { ReviewForm } from './components/ReviewForm';
import { FeedbackPanel } from './components/FeedbackPanel';
import { reviewCode } from './services/geminiService';
import { fetchCodeFromRepo } from './services/githubService';
import { SUPPORTED_LANGUAGES, APP_TITLE } from './constants';
import type { LanguageOption } from './types';
import './App.css'

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>(''); // Was 'code', now 'repoUrl'
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filesReviewed, setFilesReviewed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReview = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      setFeedback(null);
      setFilesReviewed([]);
      return;
    }
    // Basic URL validation
    try {
      const url = new URL(repoUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        setError("Invalid URL protocol. Please use https:// or http://.");
        return;
      }
      if (!url.hostname.includes('github.com')) {
        setError("Please enter a valid GitHub.com repository URL.");
        return;
      }
    } catch (_) {
      setError("Invalid URL format. Please enter a valid GitHub repository URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedback(null);
    setFilesReviewed([]);

    try {
      const { code: fetchedCode, filesReviewed: reviewedFilePaths } = await fetchCodeFromRepo(repoUrl, selectedLanguage.value);
      setFilesReviewed(reviewedFilePaths);
      
      if (!fetchedCode.trim()) {
        setError(`No reviewable code found for ${selectedLanguage.label} in the repository. The fetched files might be empty or not recognized.`);
        setIsLoading(false);
        return;
      }

      const reviewResult = await reviewCode(fetchedCode, selectedLanguage.value, reviewedFilePaths);
      setFeedback(reviewResult);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during repository processing or review.");
      console.error("Error during GitHub repo review:", err);
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, selectedLanguage]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <Header title={APP_TITLE} />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-6">
        <ReviewForm
          languages={SUPPORTED_LANGUAGES}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          repoUrl={repoUrl} // Pass repoUrl
          onRepoUrlChange={setRepoUrl} // Pass handler for repoUrl
          onSubmit={handleSubmitReview}
          isLoading={isLoading}
        />
        <FeedbackPanel
          feedback={feedback}
          isLoading={isLoading}
          error={error}
          filesReviewed={filesReviewed} // Pass filesReviewed
        />
      </main>
      <footer className="text-center p-4 text-sm text-slate-400 border-t border-slate-700">
        Developed for the Admissions Team
      </footer>
    </div>
  );
};

export default App
