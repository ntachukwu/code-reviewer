import React from 'react';
import type { GroupedCommits, CommitGroup } from '../types';
import type { GitHubCommit } from '../services/githubService';

interface CommitCardProps {
  commit: GitHubCommit;
}

const CommitCard: React.FC<CommitCardProps> = ({ commit }) => {
  const { message, author, date } = commit.commit;
  const commitDate = new Date(date);

  // Limiting message length for display
  const shortMessage = message.split('\n')[0]; // Get first line
  const displayMessage = shortMessage.length > 100 ? `${shortMessage.substring(0, 97)}...` : shortMessage;

  return (
    <div className="bg-slate-700 p-3 mb-3 rounded-lg shadow hover:shadow-md transition-shadow duration-200 ease-in-out">
      <h4 className="text-sm font-semibold text-blue-300 mb-1 break-words" title={message}>
        {displayMessage}
      </h4>
      <div className="text-xs text-slate-400">
        <p><strong>Author:</strong> {author.name} ({author.email})</p>
        <p><strong>Date:</strong> {commitDate.toLocaleString()}</p>
        <a
          href={commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline text-xs mt-1 inline-block"
        >
          View on GitHub ({commit.sha.substring(0, 7)})
        </a>
      </div>
    </div>
  );
};

interface CommitGroupProps {
  group: CommitGroup;
}

const CommitGroupDisplay: React.FC<CommitGroupProps> = ({ group }) => {
  return (
    <div className="mb-6 pl-4 border-l-2 border-slate-600">
      <h3 className="text-xl font-semibold text-slate-200 mb-3 sticky top-0 bg-slate-800 py-2 z-10">{group.scope}</h3>
      <div className="space-y-2">
        {group.commits.map(commit => (
          <CommitCard key={commit.sha} commit={commit} />
        ))}
      </div>
      {group.commits.length === 0 && <p className="text-slate-400">No commits in this group.</p>}
    </div>
  );
};

interface CommitTreeDisplayProps {
  groupedCommits: GroupedCommits | null;
  repoUrl: string; // For context, like displaying the repo name
}

export const CommitTreeDisplay: React.FC<CommitTreeDisplayProps> = ({ groupedCommits, repoUrl }) => {
  if (!groupedCommits) {
    return null; // Or a loading/placeholder state if preferred
  }

  if (groupedCommits.length === 0) {
    return (
      <div className="mt-6 p-4 bg-slate-800 rounded-lg shadow">
        <h2 className="text-2xl font-semibold text-slate-100 mb-4">Commit History</h2>
        <p className="text-slate-400">No commit data to display. This could be due to an error, an empty repository, or no commits found for the selected branch.</p>
      </div>
    );
  }

  const repoName = repoUrl.split('/').slice(-2).join('/');


  return (
    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg shadow-xl">
      <h2 className="text-2xl font-semibold text-slate-100 mb-6">Commit History for <span className='text-teal-400'>{repoName}</span></h2>
      <div className="relative"> {/* For potential sticky headers within groups */}
        {groupedCommits.map(group => (
          <CommitGroupDisplay key={group.scope} group={group} />
        ))}
      </div>
    </div>
  );
};
