import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface FeedbackPanelProps {
  feedback: string | null;
  isLoading: boolean;
  error: string | null;
  filesReviewed?: string[]; // Added to display which files were part of the review
}

// A simple component to render text with markdown-like newlines and code blocks
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const segments = text.split(/(\`\`\`[\s\S]*?\`\`\`)/g); 

  return (
    <div className="text-left"> {/* Ensure text alignment is left for prose */}
      {segments.map((segment, index) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          // Extract language hint if present, e.g., ```python
          const firstLine = segment.substring(3, segment.indexOf('\n', 3) === -1 ? segment.length -3 : segment.indexOf('\n',3) );
          const langHint = firstLine.trim().toLowerCase();
          
          let codeContent = segment.substring(3, segment.length - 3);
          // Remove the language hint line from the actual code block content
          if (LANGUAGE_HINTS.includes(langHint) || (langHint && !langHint.includes(' '))) { // simple check for language hint
             codeContent = codeContent.substring(codeContent.indexOf('\n') + 1);
          } else {
             codeContent = codeContent.trimStart(); // Trim leading newlines if no lang hint
          }
          
          return (
            <pre key={index} className="bg-slate-900 p-3 md:p-4 rounded-md overflow-x-auto my-3 text-sm font-mono shadow-inner">
              <code>{codeContent.trim()}</code>
            </pre>
          );
        }
        // Replace **text** with <strong>text</strong>, *text* or _text_ with <em>text</em>
        // and preserve newlines. Handle lists and blockquotes minimally.
        const lines = segment.split('\n').map((line, lineIndex) => {
          let processedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-300">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-700 px-1 py-0.5 rounded text-emerald-400 text-xs">$1</code>');
          
          if (processedLine.startsWith('### ')) {
            processedLine = `<h3 class="text-lg font-semibold mt-4 mb-2 text-emerald-300 border-b border-slate-700 pb-1">${processedLine.substring(4)}</h3>`;
          } else if (processedLine.startsWith('## ')) {
            processedLine = `<h2 class="text-xl font-semibold mt-5 mb-3 text-sky-300 border-b border-slate-600 pb-1">${processedLine.substring(3)}</h2>`;
          } else if (processedLine.startsWith('# ')) {
            processedLine = `<h1 class="text-2xl font-semibold mt-6 mb-4 text-sky-200 border-b border-slate-500 pb-2">${processedLine.substring(2)}</h1>`;
          } else if (processedLine.match(/^(\s*)-\s(.*)/)) { // Basic unordered list
             const match = processedLine.match(/^(\s*)-\s(.*)/);
             if (match) {
                processedLine = `<ul class="list-disc list-inside ml-4 my-1"><li class="text-slate-300">${match[2]}</li></ul>`;
             }
          } else if (processedLine.match(/^(\s*)(\d+)\.\s(.*)/)) { // Basic ordered list
             const match = processedLine.match(/^(\s*)(\d+)\.\s(.*)/);
             if (match) {
                processedLine = `<ol class="list-decimal list-inside ml-4 my-1"><li class="text-slate-300">${match[3]}</li></ol>`; // This won't group lists properly, simple line-by-line
             }
          } else if (processedLine.startsWith('> ')) {
            processedLine = `<blockquote class="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-2">${processedLine.substring(2)}</blockquote>`;
          }
          
          return <span key={lineIndex} dangerouslySetInnerHTML={{ __html: processedLine + (lineIndex === segment.split('\n').length - 1 && !processedLine.endsWith('</ul>') && !processedLine.endsWith('</ol>') ? '' : '<br/>') }} />;
        });
        // Filter out empty <br/> only spans that might occur from consecutive newlines
        const filteredLines = lines.filter(lineComp => lineComp.props.dangerouslySetInnerHTML.__html !== '<br/>');
        return <React.Fragment key={index}>{filteredLines}</React.Fragment>;
      })}
    </div>
  );
};
// Common language hints that might appear after ```
const LANGUAGE_HINTS = ['javascript', 'python', 'java', 'csharp', 'typescript', 'go', 'rust', 'html', 'css', 'cpp', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'json', 'yaml', 'bash', 'shell', 'text'];


export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, isLoading, error, filesReviewed }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center min-h-[200px] transition-all duration-300">
        <LoadingSpinner />
        <p className="mt-4 text-sky-300">AI is reviewing the repository code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl transition-all duration-300">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-center text-slate-400 min-h-[200px] flex items-center justify-center transition-all duration-300">
        <p>Enter a GitHub repository URL and select its primary language to get an AI code review.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl transition-all duration-300">
      {filesReviewed && filesReviewed.length > 0 && (
        <div className="mb-6 p-4 bg-slate-700/50 rounded-md border border-slate-600">
          <h3 className="text-md font-semibold text-sky-300 mb-2">Files Included in Review:</h3>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {filesReviewed.map(file => <li key={file}><code>{file}</code></li>)}
          </ul>
           <p className="text-xs text-slate-400 mt-2">Review is based on a selection of up to 5 relevant files or ~70k characters from the repository for the selected language.</p>
        </div>
      )}
      <h2 className="text-2xl font-semibold text-sky-400 mb-4">Review Feedback</h2>
      <div className="prose prose-sm prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
        <SimpleMarkdownRenderer text={feedback} />
      </div>
    </div>
  );
};