export interface LanguageOption {
  value: string;
  label: string;
}

// Using the GitHubCommit interface from githubService
// We might re-export it here or import it where needed.
// For now, components/services can import it directly from githubService.

export interface CommitGroup {
  scope: string; // e.g., "Issue #123" or "General Improvements"
  commits: import('./services/githubService').GitHubCommit[];
}

export type GroupedCommits = CommitGroup[];
