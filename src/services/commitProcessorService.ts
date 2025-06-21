import type { GitHubCommit } from './githubService';
import type { CommitGroup, GroupedCommits } from '../types';

// Regex to find issue numbers like #123, fixes #123, closes #123, resolves #123
// It captures the issue number.
const ISSUE_REGEX = /(?:fixes|closes|resolves)\s+#(\d+)|#(\d+)/i;

/**
 * Groups commits by scope (e.g., "Issue #123" or "General Improvements").
 * If a commit message refers to an issue number, it's grouped under that issue.
 * Otherwise, it's grouped under "General Improvements".
 *
 * @param commits Array of GitHubCommit objects.
 * @returns GroupedCommits array.
 */
export function groupCommitsByScope(commits: GitHubCommit[]): GroupedCommits {
  if (!commits || commits.length === 0) {
    return [];
  }

  const groups: Map<string, GitHubCommit[]> = new Map();

  for (const commit of commits) {
    const message = commit.commit.message;
    const match = message.match(ISSUE_REGEX);

    let scope = "General Improvements"; // Default scope

    if (match) {
      // match[1] is for "fixes #123", match[2] is for "#123"
      const issueNumber = match[1] || match[2];
      if (issueNumber) {
        scope = `Issue #${issueNumber}`;
      }
    }

    if (!groups.has(scope)) {
      groups.set(scope, []);
    }
    groups.get(scope)!.push(commit);
  }

  // Convert map to array of CommitGroup
  const result: GroupedCommits = [];
  for (const [scope, scopeCommits] of groups.entries()) {
    result.push({
      scope,
      commits: scopeCommits.sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) // Sort commits by date, newest first
    });
  }

  // Optional: Sort groups. For example, "General Improvements" last.
  result.sort((a, b) => {
    if (a.scope === "General Improvements") return 1;
    if (b.scope === "General Improvements") return -1;
    return a.scope.localeCompare(b.scope); // Sort other scopes alphabetically/numerically
  });

  return result;
}
