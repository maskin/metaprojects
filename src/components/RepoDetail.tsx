import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { RepoData } from '../types';

interface RepoDetailProps {
  repo: RepoData;
  onClose: () => void;
}

const RepoDetail: React.FC<RepoDetailProps> = ({ repo, onClose }) => {
  const [activeTab, setActiveTab] = useState<'readme' | 'files' | 'stats'>('readme');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'Java': '#b07219',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'C++': '#f34b7d',
      'C': '#555555',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Ruby': '#701516',
      'PHP': '#4F5D95',
    };
    return colors[language] || '#cccccc';
  };

  const getFileExtension = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'md': 'markdown',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'html': 'html',
      'css': 'css',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'cpp': 'cpp',
      'c': 'c',
    };
    return langMap[ext] || 'text';
  };

  const totalBytes = Object.values(repo.languages).reduce((sum, bytes) => sum + bytes, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{repo.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{repo.fullName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              <span>GitHub</span>
            </a>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex space-x-1 px-6">
          <button
            onClick={() => setActiveTab('readme')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'readme'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            README
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'files'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ファイル ({repo.mainFiles.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            統計
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'readme' && (
            <div>
              {repo.readme ? (
                <div className="prose max-w-none">
                  <div className="markdown-body">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {repo.readme.content}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">READMEが見つかりませんでした</p>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-4">
              {repo.mainFiles.length > 0 ? (
                repo.mainFiles.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="font-mono text-sm text-gray-700">{file.path}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        language={getFileExtension(file.path)}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, borderRadius: 0 }}
                      >
                        {file.content}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">ファイルが見つかりませんでした</p>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">基本情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">スター数</div>
                    <div className="text-2xl font-bold text-gray-800">{repo.stars}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">フォーク数</div>
                    <div className="text-2xl font-bold text-gray-800">{repo.forks}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">作成日</div>
                    <div className="text-sm font-medium text-gray-800">{formatDate(repo.createdAt)}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">最終更新</div>
                    <div className="text-sm font-medium text-gray-800">{formatDate(repo.updatedAt)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">言語別コード量</h3>
                {Object.keys(repo.languages).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(repo.languages)
                      .sort(([, a], [, b]) => b - a)
                      .map(([lang, bytes]) => {
                        const percentage = ((bytes / totalBytes) * 100).toFixed(1);
                        return (
                          <div key={lang} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getLanguageColor(lang) }}
                                ></span>
                                <span className="font-medium">{lang}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">{percentage}%</span>
                                <span className="text-gray-500 text-xs">
                                  {(bytes / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: getLanguageColor(lang)
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-gray-500">言語情報がありません</p>
                )}
              </div>

              {repo.topics.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">トピック</h3>
                  <div className="flex flex-wrap gap-2">
                    {repo.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoDetail;

