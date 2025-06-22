import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ReviewForm } from './components/ReviewForm';
import { FeedbackPanel } from './components/FeedbackPanel';
import { CommitTreeDisplay } from './components/CommitTreeDisplay';
import { reviewCode } from './services/geminiService';
import { fetchCodeFromRepo, fetchCommits, parseGitHubUrl } from './services/githubService';
import { groupCommitsByScope } from './services/commitProcessorService';
import { SUPPORTED_LANGUAGES, APP_TITLE } from './constants';
import type { LanguageOption, GroupedCommits } from './types';
import './App.css'; // Keep for any App-specific overrides not covered by index.css

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filesReviewed, setFilesReviewed] = useState<string[]>([]);
  const [groupedCommits, setGroupedCommits] = useState<GroupedCommits | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReview = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      setFeedback(null);
      setFilesReviewed([]);
      setGroupedCommits(null);
      return;
    }

    let parsedUrlInfo;
    try {
      const url = new URL(repoUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        setError("Invalid URL protocol. Please use https:// or http://.");
        return;
      }
      parsedUrlInfo = parseGitHubUrl(repoUrl);
      if (!parsedUrlInfo) {
        setError("Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo.");
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
    setGroupedCommits(null);

    try {
      const { owner, repo, defaultBranch = 'main' } = parsedUrlInfo;
      const [reviewData, rawCommits] = await Promise.allSettled([
        fetchCodeFromRepo(repoUrl, selectedLanguage.value),
        fetchCommits(owner, repo, defaultBranch)
      ]);

      let fetchError = false;

      if (reviewData.status === 'fulfilled') {
        const { code: fetchedCode, filesReviewed: reviewedFilePaths } = reviewData.value;
        setFilesReviewed(reviewedFilePaths);
        if (!fetchedCode.trim()) {
          setError(prevError => prevError ? `${prevError}\nNo reviewable code found for ${selectedLanguage.label}.` : `No reviewable code found for ${selectedLanguage.label} in the repository.`);
        } else {
          const reviewResult = await reviewCode(fetchedCode, selectedLanguage.value, reviewedFilePaths);
          setFeedback(reviewResult);
        }
      } else {
        console.error("Error fetching code for review:", reviewData.reason);
        setError(prevError => prevError ? `${prevError}\n${reviewData.reason.message}` : reviewData.reason.message);
        fetchError = true;
      }

      if (rawCommits.status === 'fulfilled') {
        if (rawCommits.value.length > 0) {
          const processedCommits = groupCommitsByScope(rawCommits.value);
          setGroupedCommits(processedCommits);
        } else {
           setGroupedCommits([]);
           console.warn("No commits found for the repository/branch.");
        }
      } else {
        console.error("Error fetching commits:", rawCommits.reason);
        setError(prevError => prevError ? `${prevError}\nFailed to fetch commits: ${rawCommits.reason.message}` : `Failed to fetch commits: ${rawCommits.reason.message}`);
        fetchError = true;
      }
      
      if (fetchError && reviewData.status === 'rejected' && rawCommits.status === 'rejected') {
         setError("Failed to fetch both code for review and commit history. Please check the repository URL and your connection.");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during repository processing.");
      console.error("Error during GitHub repo processing:", err);
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, selectedLanguage]);

  // Main application layout adjustments for Material Design
  // The global background is set in index.css (#121212).
  // We ensure text color is appropriate for dark theme (slate-100 or similar).
  // Spacing between major components (ReviewForm, FeedbackPanel, CommitTreeDisplay) is increased (space-y-8 or space-y-10).
  return (
    <div className="min-h-screen flex flex-col text-slate-100 bg-gray-900"> {/* Changed bg-gradient to bg-gray-900 (similar to #121212) */}
      <Header title={APP_TITLE} />
      {/* Increased vertical spacing (space-y-8) and horizontal padding (px-4 md:px-8) for main content area */}
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <ReviewForm
          languages={SUPPORTED_LANGUAGES}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          repoUrl={repoUrl}
          onRepoUrlChange={setRepoUrl}
          onSubmit={handleSubmitReview}
          isLoading={isLoading}
        />
        <FeedbackPanel
          feedback={feedback}
          isLoading={isLoading}
          error={error}
          filesReviewed={filesReviewed}
        />

        {!isLoading && groupedCommits && (
          <CommitTreeDisplay groupedCommits={groupedCommits} repoUrl={repoUrl} />
        )}

        {!isLoading && !error && groupedCommits && groupedCommits.length === 0 && (
           // Styled this "no commits" message like a Material Design "empty state" or info card
           <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-300 text-lg">No commits found.</p>
            <p className="text-slate-400 text-sm mt-1">The primary branch of this repository may not have any commits yet.</p>
          </div>
        )}
      </main>
      {/* Footer styling: subtle, common in Material Design footers */}
      <footer className="text-center p-6 text-sm text-slate-500 border-t border-slate-700/50">
        Developed for the Admissions Team
      </footer>
    </div>
  );
};

export default App;
