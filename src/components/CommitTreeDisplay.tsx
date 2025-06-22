import React from 'react';
import type { GroupedCommits, CommitGroup } from '../types';
import type { GitHubCommit } from '../services/githubService';

interface CommitCardProps {
  commit: GitHubCommit;
}

const CommitCard: React.FC<CommitCardProps> = ({ commit }) => {
  const { message, author, date } = commit.commit;
  const commitDate = new Date(date);
  const shortMessage = message.split('\n')[0];
  const displayMessage = shortMessage.length > 80 ? `${shortMessage.substring(0, 77)}...` : shortMessage; // Shorter for horizontal cards

  return (
    // Card styling for horizontal display: fixed width, height, margin for spacing
    // Material Design card principles: elevation, rounded corners
    <div className="bg-slate-700 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out w-72 h-48 flex flex-col justify-between mr-4 flex-shrink-0">
      <div>
        <h4 className="text-sm font-medium text-purple-300 mb-1.5 break-words" title={message}>
          {displayMessage}
        </h4>
        <div className="text-xs text-slate-400 space-y-0.5">
          <p><strong>Author:</strong> {author.name}</p>
          <p><strong>Date:</strong> {commitDate.toLocaleDateString()} {commitDate.toLocaleTimeString()}</p>
        </div>
      </div>
      <a
        href={commit.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-400 hover:text-purple-300 hover:underline text-xs mt-2 inline-block self-start"
      >
        View on GitHub ({commit.sha.substring(0, 7)})
      </a>
    </div>
  );
};

interface CommitGroupProps {
  group: CommitGroup;
}

const CommitGroupDisplay: React.FC<CommitGroupProps> = ({ group }) => {
  return (
    // Each group is a flex container for its cards, allowing them to line up horizontally.
    // It will be part of the larger horizontal scroll container.
    // Adding some right margin for spacing between groups if they wrap or for visual separation.
    <div className="mr-6 flex-shrink-0"> {/* flex-shrink-0 prevents group from shrinking */}
      <h3 className="text-lg font-medium text-slate-100 mb-3 sticky left-0 bg-slate-800 py-2 px-1 z-10 inline-block rounded-r-md shadow"> {/* Sticky group title to the left */}
        {group.scope}
      </h3>
      {/* Horizontal list of commit cards */}
      <div className="flex overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {group.commits.map(commit => (
          <CommitCard key={commit.sha} commit={commit} />
        ))}
      </div>
      {group.commits.length === 0 && <p className="text-slate-400 mt-2 text-sm">No commits in this scope.</p>}
    </div>
  );
};

interface CommitTreeDisplayProps {
  groupedCommits: GroupedCommits | null;
  repoUrl: string;
}

export const CommitTreeDisplay: React.FC<CommitTreeDisplayProps> = ({ groupedCommits, repoUrl }) => {
  if (!groupedCommits) {
    return null;
  }
  // This message is handled by App.tsx now for better context
  // if (groupedCommits.length === 0) {
  //   return ( ... )
  // }

  const repoName = repoUrl.split('/').slice(-2).join('/');

  return (
    // Main container for commit history, styled as a Material card.
    // Overall title for the section.
    <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-xl">
      <h2 className="text-xl font-medium text-purple-300 mb-5">
        Commit History for <span className='font-semibold text-purple-200'>{repoName}</span>
      </h2>
      {/* This div will contain all commit groups and scroll horizontally. */}
      {/* Added padding for scrollbar visibility if needed & visual appeal */}
      <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
        {groupedCommits.map(group => (
          // Each CommitGroupDisplay is now a direct child of this flex container.
          <CommitGroupDisplay key={group.scope} group={group} />
        ))}
      </div>
       {groupedCommits.length === 0 && ( // Show this only if there are no groups at all (already handled in App.tsx but good fallback)
         <p className="text-slate-400 text-center py-4">No commit groups to display.</p>
      )}
    </div>
  );
};
