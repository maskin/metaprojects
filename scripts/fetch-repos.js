import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let GITHUB_TOKEN;

const API_BASE = 'https://api.github.com';
const MAIN_FILE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.py', '.md', '.json', '.yaml', '.yml', '.html', '.css', '.java', '.go', '.rs', '.cpp', '.c'];

async function getGitHubToken() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question('Please enter your GitHub Personal Access Token: ', (token) => {
      rl.close();
      resolve(token);
    });
  });
}

async function makeRequest(url, options = {}) {
  const HEADERS = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Repos-Dashboard'
  };

  const response = await fetch(url, { ...options, headers: { ...HEADERS, ...options.headers } });

  const remaining = parseInt(response.headers.get('x-ratelimit-remaining') || '0');
  const resetTime = parseInt(response.headers.get('x-ratelimit-reset') || '0');

  if (response.status === 403 && remaining === 0) {
    const waitTime = resetTime * 1000 - Date.now() + 1000;
    console.warn(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return makeRequest(url, options);
  }

  if (!response.ok && response.status !== 404) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response;
}

async function fetchAllRepos() {
  const repos = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await makeRequest(`${API_BASE}/user/repos?per_page=100&page=${page}&sort=updated&direction=desc`);
    const data = await response.json();
    if (data.length === 0) {
      hasMore = false;
    } else {
      repos.push(...data);
      page++;
    }
  }

  return repos;
}

async function fetchRepoDetails(repo) {
  const [readme, languages, contents] = await Promise.all([
    fetchReadme(repo),
    fetchLanguages(repo),
    fetchMainFiles(repo)
  ]);

  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.updated_at,
    createdAt: repo.created_at,
    size: repo.size,
    defaultBranch: repo.default_branch,
    topics: repo.topics || [],
    readme: readme,
    languages: languages,
    mainFiles: contents
  };
}

async function fetchReadme(repo) {
  try {
    const response = await makeRequest(`${API_BASE}/repos/${repo.full_name}/readme`);
    if (response.ok) {
      const data = await response.json();
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return {
        content: content,
        encoding: data.encoding
      };
    }
  } catch (error) {
    console.warn(`Failed to fetch README for ${repo.full_name}:`, error.message);
  }
  return null;
}

async function fetchLanguages(repo) {
  try {
    const response = await makeRequest(`${API_BASE}/repos/${repo.full_name}/languages`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`Failed to fetch languages for ${repo.full_name}:`, error.message);
  }
  return {};
}

async function fetchMainFiles(repo) {
  const files = [];
  const maxFiles = 10;

  try {
    const tree = await fetchRepoTree(repo, repo.default_branch);
    const mainFiles = tree
      .filter(item => {
        const ext = path.extname(item.path).toLowerCase();
        return MAIN_FILE_EXTENSIONS.includes(ext) && item.size < 100000;
      })
      .sort((a, b) => {
        const priorityA = getFilePriority(a.path);
        const priorityB = getFilePriority(b.path);
        return priorityB - priorityA;
      })
      .slice(0, maxFiles);

    for (const file of mainFiles) {
      try {
        const content = await fetchFileContent(repo, file.path);
        if (content) {
          files.push({
            path: file.path,
            size: file.size,
            content: content
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch content for ${file.path}:`, error.message);
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch tree for ${repo.full_name}:`, error.message);
  }

  return files;
}

function getFilePriority(filePath) {
  const name = path.basename(filePath).toLowerCase();
  if (name === 'readme.md' || name === 'readme') return 100;
  if (name.startsWith('package.json') || name.startsWith('requirements.txt') || name.startsWith('pom.xml')) return 90;
  if (name.startsWith('main.') || name.startsWith('index.')) return 80;
  if (name.startsWith('app.')) return 70;
  return 50;
}

async function fetchRepoTree(repo, branch) {
  try {
    const response = await makeRequest(`${API_BASE}/repos/${repo.full_name}/git/trees/${branch}?recursive=1`);
    if (response.ok) {
      const data = await response.json();
      return data.tree.filter(item => item.type === 'blob');
    }
  } catch (error) {
    console.warn(`Failed to fetch tree for ${repo.full_name}:`, error.message);
  }
  return [];
}

async function fetchFileContent(repo, filePath) {
  try {
    const response = await makeRequest(`${API_BASE}/repos/${repo.full_name}/contents/${filePath}`);
    if (response.ok) {
      const data = await response.json();
      if (data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return data.content;
    }
  } catch (error) {
    console.warn(`Failed to fetch content for ${filePath}:`, error.message);
  }
  return null;
}

async function main() {
  if (process.env.GITHUB_TOKEN) {
    GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  } else {
    GITHUB_TOKEN = await getGitHubToken();
  }

  if (!GITHUB_TOKEN) {
    console.error('Error: GitHub token is required.');
    process.exit(1);
  }

  console.log('Fetching repositories...');
  const repos = await fetchAllRepos();
  console.log(`Found ${repos.length} repositories`);

  const reposData = [];
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    console.log(`Processing ${i + 1}/${repos.length}: ${repo.full_name}`);
    try {
      const details = await fetchRepoDetails(repo);
      reposData.push(details);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing ${repo.full_name}:`, error.message);
    }
  }

  const outputPath = path.join(__dirname, '../public/repos-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(reposData, null, 2));
  console.log(`Data saved to ${outputPath}`);
  console.log(`Total repositories processed: ${reposData.length}`);
}

main().catch(console.error);

