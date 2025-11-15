export interface RepoData {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  createdAt: string;
  size: number;
  defaultBranch: string;
  topics: string[];
  readme: {
    content: string;
    encoding: string;
  } | null;
  languages: Record<string, number>;
  mainFiles: Array<{
    path: string;
    size: number;
    content: string;
  }>;
}

