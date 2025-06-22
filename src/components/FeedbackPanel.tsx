import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage'; // ErrorMessage should also be styled for Material if not already

interface FeedbackPanelProps {
  feedback: string | null;
  isLoading: boolean;
  error: string | null;
  filesReviewed?: string[];
}

// A simple component to render text with markdown-like newlines and code blocks
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const segments = text.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

  return (
    // Using Material Design typography classes where appropriate (e.g., body1, caption)
    // These would typically be defined in a global CSS or a theme provider.
    // For now, using Tailwind to approximate.
    <div className="text-left text-slate-200"> {/* Base text color for readability */}
      {segments.map((segment, index) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const firstLine = segment.substring(3, segment.indexOf('\n', 3) === -1 ? segment.length -3 : segment.indexOf('\n',3) );
          const langHint = firstLine.trim().toLowerCase();
          
          let codeContent = segment.substring(3, segment.length - 3);
          if (LANGUAGE_HINTS.includes(langHint) || (langHint && !langHint.includes(' '))) {
             codeContent = codeContent.substring(codeContent.indexOf('\n') + 1);
          } else {
             codeContent = codeContent.trimStart();
          }
          
          return (
            // Code blocks with Material Design like background and shadow
            <pre key={index} className="bg-slate-900 p-4 rounded-md overflow-x-auto my-4 text-sm font-mono shadow-md">
              <code>{codeContent.trim()}</code>
            </pre>
          );
        }

        const lines = segment.split('\n').map((line, lineIndex) => {
          let processedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-medium text-purple-300">$1</strong>') // Material uses font-medium for emphasis
            .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
            .replace(/_(.*?)_/g, '<em class="italic text-slate-300">$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1.5 py-0.5 rounded text-sm text-amber-300">$1</code>'); // Inline code style
          
          // Material Design heading styles (approximate with Tailwind)
          if (processedLine.startsWith('### ')) {
            processedLine = `<h3 class="text-lg font-medium mt-6 mb-2 text-purple-300 border-b border-slate-700 pb-1">${processedLine.substring(4)}</h3>`; // h6 in MD
          } else if (processedLine.startsWith('## ')) {
            processedLine = `<h2 class="text-xl font-medium mt-8 mb-3 text-purple-300 border-b border-slate-600 pb-1.5">${processedLine.substring(3)}</h3>`; // h5 in MD
          } else if (processedLine.startsWith('# ')) {
            processedLine = `<h1 class="text-2xl font-medium mt-10 mb-4 text-purple-200 border-b border-slate-500 pb-2">${processedLine.substring(2)}</h1>`; // h4 in MD
          } else if (processedLine.match(/^(\s*)-\s(.*)/)) {
             const match = processedLine.match(/^(\s*)-\s(.*)/);
             if (match) {
                // Applying margin that is common in MD lists
                processedLine = `<ul class="list-disc list-outside ml-5 my-1 space-y-1"><li class="text-slate-300">${match[2]}</li></ul>`;
             }
          } else if (processedLine.match(/^(\s*)(\d+)\.\s(.*)/)) {
             const match = processedLine.match(/^(\s*)(\d+)\.\s(.*)/);
             if (match) {
                processedLine = `<ol class="list-decimal list-outside ml-5 my-1 space-y-1"><li class="text-slate-300">${match[3]}</li></ol>`;
             }
          } else if (processedLine.startsWith('> ')) {
            // Blockquote with Material Design like styling
            processedLine = `<blockquote class="border-l-4 border-purple-500 pl-4 italic text-slate-400 my-4 py-1">${processedLine.substring(2)}</blockquote>`;
          }
          
          return <span key={lineIndex} dangerouslySetInnerHTML={{ __html: processedLine + (lineIndex === segment.split('\n').length - 1 && !processedLine.endsWith('</ul>') && !processedLine.endsWith('</ol>') ? '' : '<br/>') }} />;
        });
        const filteredLines = lines.filter(lineComp => lineComp.props.dangerouslySetInnerHTML.__html !== '<br/>');
        return <React.Fragment key={index}>{filteredLines}</React.Fragment>;
      })}
    </div>
  );
};
const LANGUAGE_HINTS = ['javascript', 'python', 'java', 'csharp', 'typescript', 'go', 'rust', 'html', 'css', 'cpp', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'json', 'yaml', 'bash', 'shell', 'text'];


export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, isLoading, error, filesReviewed }) => {
  // Using Material Design card styling: bg-slate-800 (surface color), rounded-lg, shadow-xl (elevation)
  // Padding adjusted for Material Design spec (e.g., 16dp or 24dp, p-6 or p-8)
  const cardBaseClass = "bg-slate-800 p-6 md:p-8 rounded-lg shadow-xl transition-all duration-300";

  if (isLoading) {
    return (
      <div className={`${cardBaseClass} flex flex-col items-center justify-center min-h-[250px]`}> {/* Increased min-height */}
        <LoadingSpinner size="lg" /> {/* Larger spinner */}
        <p className="mt-5 text-lg text-purple-300">AI is reviewing the repository code...</p> {/* Material-aligned text */}
      </div>
    );
  }

  if (error) {
    // ErrorMessage component should ideally be styled with Material Design principles too.
    // For example, using MD's error colors and typography.
    return (
      <div className={`${cardBaseClass}`}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className={`${cardBaseClass} text-center text-slate-400 min-h-[250px] flex flex-col items-center justify-center`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">Submit a GitHub repository to begin.</p>
        <p className="text-sm text-slate-500 mt-1">Select its primary language and URL above to get an AI code review.</p>
      </div>
    );
  }

  return (
    <div className={`${cardBaseClass}`}>
      {filesReviewed && filesReviewed.length > 0 && (
        // Files reviewed section styled like a less prominent card or info box
        <div className="mb-8 p-4 bg-slate-700/70 rounded-lg border border-slate-600">
          <h3 className="text-md font-medium text-purple-300 mb-2">Files Included in Review:</h3>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5">
            {filesReviewed.map(file => <li key={file}><code className="bg-slate-600 px-1.5 py-0.5 rounded text-xs text-amber-300">{file}</code></li>)}
          </ul>
           <p className="text-xs text-slate-400 mt-3">
             Review is based on a selection of relevant files (up to 5 or ~70k chars) for the chosen language.
           </p>
        </div>
      )}
      {/* Title for the feedback section, using Material Design typography (h5 or h6 equivalent) */}
      <h2 className="text-xl font-medium text-purple-300 mb-5">Review Feedback</h2>
      {/* prose classes provide some defaults, ensure they align with Material Design or override as needed */}
      <div className="prose prose-sm prose-invert max-w-none text-slate-200 leading-relaxed md:prose-base">
        <SimpleMarkdownRenderer text={feedback} />
      </div>
    </div>
  );
};