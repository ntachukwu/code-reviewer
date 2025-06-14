import type { LanguageOption } from './types';

export const APP_TITLE = "AI Code Reviewer";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'shell', label: 'Shell Script' },
];

export const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  javascript: ['.js', '.jsx'],
  python: ['.py'],
  typescript: ['.ts', '.tsx'],
  java: ['.java'],
  csharp: ['.cs'],
  go: ['.go'],
  rust: ['.rs'],
  html: ['.html', '.htm'],
  css: ['.css'],
  cpp: ['.cpp', '.cxx', '.h', '.hpp'],
  php: ['.php'],
  ruby: ['.rb'],
  swift: ['.swift'],
  kotlin: ['.kt', '.kts'],
  sql: ['.sql'],
  markdown: ['.md', '.markdown'],
  json: ['.json'],
  shell: ['.sh', '.bash'],
};

export const MAX_FILES_TO_REVIEW = 5; // Max number of files to fetch from repo
export const MAX_CODE_LENGTH_FOR_REVIEW = 70000; // Max total characters of code to send for review (approx 100k tokens for Gemini)
export const GITHUB_API_BASE_URL = 'https://api.github.com';
export const GITHUB_RAW_CONTENT_BASE_URL = 'https://raw.githubusercontent.com';

export const COMMON_SOURCE_DIRS = ['src', 'app', 'lib', 'source', 'sources', 'main'];
export const COMMON_IGNORED_DIRS = ['node_modules', 'dist', 'build', 'target', 'vendor', 'test', 'tests', 'docs', 'examples', '.git', '.github', 'assets', 'static'];
