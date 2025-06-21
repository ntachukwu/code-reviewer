import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ReviewForm } from './components/ReviewForm';
import { FeedbackPanel } from './components/FeedbackPanel';
import { CommitTreeDisplay } from './components/CommitTreeDisplay'; // Import CommitTreeDisplay
import { reviewCode } from './services/geminiService';
import { fetchCodeFromRepo, fetchCommits, parseGitHubUrl } from './services/githubService'; // Import fetchCommits and parseGitHubUrl
import { groupCommitsByScope } from './services/commitProcessorService'; // Import groupCommitsByScope
import { SUPPORTED_LANGUAGES, APP_TITLE } from './constants';
import type { LanguageOption, GroupedCommits } from './types'; // Import GroupedCommits
import './App.css';

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(SUPPORTED_LANGUAGES[0]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filesReviewed, setFilesReviewed] = useState<string[]>([]);
  const [groupedCommits, setGroupedCommits] = useState<GroupedCommits | null>(null); // State for grouped commits
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
      const url = new URL(repoUrl); // Standard URL parsing for basic validation
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        setError("Invalid URL protocol. Please use https:// or http://.");
        return;
      }
      parsedUrlInfo = parseGitHubUrl(repoUrl); // Use our specific parser
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
    setGroupedCommits(null); // Reset commits on new submission

    try {
      const { owner, repo, defaultBranch = 'main' } = parsedUrlInfo;

      // Fetch code for review and commits in parallel
      const [reviewData, rawCommits] = await Promise.allSettled([
        fetchCodeFromRepo(repoUrl, selectedLanguage.value),
        fetchCommits(owner, repo, defaultBranch) // Use defaultBranch from parsed URL
      ]);

      let fetchError = false;

      // Handle code fetching results
      if (reviewData.status === 'fulfilled') {
        const { code: fetchedCode, filesReviewed: reviewedFilePaths } = reviewData.value;
        setFilesReviewed(reviewedFilePaths);
        if (!fetchedCode.trim()) {
          setError(prevError => prevError ? `${prevError}\nNo reviewable code found for ${selectedLanguage.label}.` : `No reviewable code found for ${selectedLanguage.label} in the repository.`);
          // Don't return yet, try to process commits
        } else {
          const reviewResult = await reviewCode(fetchedCode, selectedLanguage.value, reviewedFilePaths);
          setFeedback(reviewResult);
        }
      } else {
        console.error("Error fetching code for review:", reviewData.reason);
        setError(prevError => prevError ? `${prevError}\n${reviewData.reason.message}` : reviewData.reason.message);
        fetchError = true;
      }

      // Handle commit fetching results
      if (rawCommits.status === 'fulfilled') {
        if (rawCommits.value.length > 0) {
          const processedCommits = groupCommitsByScope(rawCommits.value);
          setGroupedCommits(processedCommits);
        } else {
           setGroupedCommits([]); // Explicitly set to empty array if no commits found
           console.warn("No commits found for the repository/branch.");
        }
      } else {
        console.error("Error fetching commits:", rawCommits.reason);
        setError(prevError => prevError ? `${prevError}\nFailed to fetch commits: ${rawCommits.reason.message}` : `Failed to fetch commits: ${rawCommits.reason.message}`);
        fetchError = true;
      }
      
      // If both failed, ensure error is prominent
      if (fetchError && reviewData.status === 'rejected' && rawCommits.status === 'rejected') {
         setError("Failed to fetch both code for review and commit history. Please check the repository URL and your connection.");
      }

    } catch (err: any) {
      // This catch block handles errors from parseGitHubUrl or other synchronous errors
      setError(err.message || "An unexpected error occurred during repository processing.");
      console.error("Error during GitHub repo processing:", err);
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
          repoUrl={repoUrl}
          onRepoUrlChange={setRepoUrl}
          onSubmit={handleSubmitReview}
          isLoading={isLoading}
        />
        <FeedbackPanel
          feedback={feedback}
          isLoading={isLoading} // isLoading is true for both review and commits
          error={error}
          filesReviewed={filesReviewed}
        />
        {/* Conditionally render CommitTreeDisplay */}
        {/* Show only if not loading and there's either commit data or no specific "commit fetch" error component yet */}
        {!isLoading && groupedCommits && (
          <CommitTreeDisplay groupedCommits={groupedCommits} repoUrl={repoUrl} />
        )}
        {/* Explicit message if commits were attempted but none found and no other error is present */}
        {!isLoading && !error && groupedCommits && groupedCommits.length === 0 && (
           <div className="mt-6 p-4 bg-slate-800/50 rounded-lg shadow">
            <p className="text-slate-400 text-center">No commits were found for the primary branch of this repository.</p>
          </div>
        )}
      </main>
      <footer className="text-center p-4 text-sm text-slate-400 border-t border-slate-700">
        Developed for the Admissions Team
      </footer>
    </div>
  );
};

export default App;
