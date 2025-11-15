import React, { useState, useMemo, useEffect } from 'react';
import RepoCard from './components/RepoCard';
import RepoDetail from './components/RepoDetail';
import { RepoData } from './types';

const App: React.FC = () => {
  const [selectedRepo, setSelectedRepo] = useState<RepoData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');
  const [repos, setRepos] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/';
    fetch(`${basePath}repos-data.json`)
      .then(res => res.json())
      .then((data: RepoData[]) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load repository data:', err);
        setLoading(false);
      });
  }, []);

  // 利用可能な言語のリストを取得
  const availableLanguages = useMemo(() => {
    const languages = new Set<string>();
    repos.forEach(repo => {
      if (repo.language) {
        languages.add(repo.language);
      }
    });
    return Array.from(languages).sort();
  }, [repos]);

  // フィルタリングとソート
  const filteredAndSortedRepos = useMemo(() => {
    let filtered = repos.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [repos, searchQuery, languageFilter, sortBy]);

  const totalRepos = repos.length;
  const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            GitHub Repositories Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">総リポジトリ数</div>
              <div className="text-2xl font-bold text-blue-900">{totalRepos}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">総スター数</div>
              <div className="text-2xl font-bold text-yellow-900">{totalStars.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">総フォーク数</div>
              <div className="text-2xl font-bold text-green-900">{totalForks.toLocaleString()}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="リポジトリ名または説明で検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                言語
              </label>
              <select
                id="language"
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                並び替え
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'updated' | 'stars' | 'name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="updated">最終更新日</option>
                <option value="stars">スター数</option>
                <option value="name">名前</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 text-gray-600">
          {filteredAndSortedRepos.length} 件のリポジトリが見つかりました
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onClick={() => setSelectedRepo(repo)}
            />
          ))}
        </div>
        {filteredAndSortedRepos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">リポジトリが見つかりませんでした</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedRepo && (
        <RepoDetail
          repo={selectedRepo}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
};

export default App;

