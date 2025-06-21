import {
  LANGUAGE_EXTENSIONS,
  MAX_FILES_TO_REVIEW,
  MAX_CODE_LENGTH_FOR_REVIEW,
  GITHUB_API_BASE_URL,
  GITHUB_RAW_CONTENT_BASE_URL,
  COMMON_SOURCE_DIRS,
  COMMON_IGNORED_DIRS
} from '../constants';

interface GitHubFile {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  url: string;
  size?: number;
}

interface FetchedCode {
  code: string;
  filesReviewed: string[];
}

function isValidGitHubUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === 'github.com';
  } catch (e) {
    return false;
  }
}

function parseGitHubUrl(repoUrl: string): { owner: string; repo: string; defaultBranch?: string } | null {
  if (!isValidGitHubUrl(repoUrl)) return null;
  try {
    const url = new URL(repoUrl);
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length < 2) return null;
    
    const owner = pathParts[0];
    const repo = pathParts[1];
    // Basic branch detection if path is like /owner/repo/tree/branch_name
    const defaultBranch = (pathParts.length > 3 && pathParts[2] === 'tree') ? pathParts[3] : 'main';

    return { owner, repo, defaultBranch };
  } catch (e) {
    console.error("Error parsing GitHub URL:", e);
    return null;
  }
}

async function fetchRepoTree(owner: string, repo: string, branch: string): Promise<GitHubFile[]> {
  const url = `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) throw new Error(`Repository or branch not found: ${owner}/${repo} (branch: ${branch}). Please check the URL and ensure the branch exists.`);
    if (response.status === 403) throw new Error(`GitHub API rate limit exceeded or access forbidden. Please try again later or check credentials if it's a private repository.`);
    throw new Error(`Failed to fetch repository file tree (status ${response.status}).`);
  }
  const data = await response.json();
  console.log(data)
  return data.tree.filter((file: GitHubFile) => file.type === 'blob'); // Only interested in files
}

function filterAndSortFiles(files: GitHubFile[], language: string): GitHubFile[] {
  const extensions = LANGUAGE_EXTENSIONS[language] || [];
  if (extensions.length === 0) return [];

  return files
    .filter(file => {
      const lowerPath = file.path.toLowerCase();
      return extensions.some(ext => lowerPath.endsWith(ext)) &&
             !COMMON_IGNORED_DIRS.some(ignoredDir => lowerPath.startsWith(ignoredDir + '/'));
    })
    .sort((a, b) => {
      // Prioritize files in common source directories
      const aInSrc = COMMON_SOURCE_DIRS.some(srcDir => a.path.toLowerCase().startsWith(srcDir + '/'));
      const bInSrc = COMMON_SOURCE_DIRS.some(srcDir => b.path.toLowerCase().startsWith(srcDir + '/'));
      if (aInSrc && !bInSrc) return -1;
      if (!aInSrc && bInSrc) return 1;
      // Optional: prioritize by path depth or name, but current filtering is primary
      return a.path.localeCompare(b.path);
    });
}

async function fetchFileContent(owner: string, repo: string, branch: string, filePath: string): Promise<string> {
  // Using raw.githubusercontent.com is generally more robust for public file content
  const url = `${GITHUB_RAW_CONTENT_BASE_URL}/${owner}/${repo}/${branch}/${filePath}`;
  const response = await fetch(url);
  if (!response.ok) {
    // Attempt fallback with API for blob if raw fails (e.g. for very new commits not yet on raw CDN)
    // This part can be more complex due to base64 decoding, so keeping it simpler for now.
    console.warn(`Failed to fetch raw content for ${filePath} (status ${response.status}).`);
    throw new Error(`Failed to fetch content for file: ${filePath}`);
  }
  return response.text();
}

export async function fetchCodeFromRepo(repoUrl: string, language: string): Promise<FetchedCode> {
  const repoInfo = parseGitHubUrl(repoUrl);
  if (!repoInfo) {
    throw new Error("Invalid GitHub repository URL. Please use a format like https://github.com/owner/repo.");
  }

  const { owner, repo, defaultBranch = 'main' } // Default to 'main'
    = repoInfo;

  let allFiles;
  try {
    allFiles = await fetchRepoTree(owner, repo, defaultBranch);
  } catch (e: any) {
    // Try 'master' if 'main' fails, as older repos might use it.
    if (defaultBranch === 'main' && e.message.includes("branch not found")) {
      console.warn("Branch 'main' not found, trying 'master'.");
      try {
        allFiles = await fetchRepoTree(owner, repo, 'master');
      } catch (e2: any) {
         throw new Error(`Failed to fetch repository tree. Neither 'main' nor 'master' branch found or other API error: ${e2.message}`);
      }
    } else {
      throw e; // Re-throw original error
    }
  }
  

  const relevantFiles = filterAndSortFiles(allFiles, language);
  if (relevantFiles.length === 0) {
    throw new Error(`No relevant ${language} files found in the repository. Supported extensions: ${(LANGUAGE_EXTENSIONS[language] || []).join(', ')}`);
  }

  const filesToFetch = relevantFiles.slice(0, MAX_FILES_TO_REVIEW);
  let concatenatedCode = "";
  const filesReviewed: string[] = [];
  let currentLength = 0;

  for (const file of filesToFetch) {
    try {
      const content = await fetchFileContent(owner, repo, defaultBranch, file.path);
      if (currentLength + content.length > MAX_CODE_LENGTH_FOR_REVIEW && filesReviewed.length > 0) {
        // If adding this file exceeds max length, and we already have some files, stop.
        // If it's the first file and it's too long, we might truncate or skip, but for now, we'll just stop.
        console.warn(`Skipping remaining files as total code length would exceed ${MAX_CODE_LENGTH_FOR_REVIEW} characters.`);
        break;
      }
      concatenatedCode += `// File: ${file.path}\n\n${content}\n\n// --- End of File: ${file.path} ---\n\n`;
      filesReviewed.push(file.path);
      currentLength += content.length; // Approximate, actual characters added is more
      if (currentLength >= MAX_CODE_LENGTH_FOR_REVIEW) break;

    } catch (error: any) {
      console.warn(`Could not fetch content for ${file.path}: ${error.message}`);
      // Continue to try fetching other files
    }
  }

  if (concatenatedCode.trim() === "") {
    if (relevantFiles.length > 0 && filesToFetch.length > 0) {
         throw new Error(`Successfully identified ${language} files, but failed to fetch content for all selected files: ${filesToFetch.map(f=>f.path).join(', ')}. Please check file accessibility or try again.`);
    }
    throw new Error(`No ${language} code could be fetched from the repository. Ensure files exist and are publicly accessible.`);
  }

  return { code: concatenatedCode, filesReviewed };
}
