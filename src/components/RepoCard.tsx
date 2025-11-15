import React from 'react';
import { RepoData } from '../types';

interface RepoCardProps {
  repo: RepoData;
  onClick: () => void;
}

const RepoCard: React.FC<RepoCardProps> = ({ repo, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageColor = (language: string | null) => {
    const colors: Record<string, string> = {
      'JavaScript': 'bg-yellow-400',
      'TypeScript': 'bg-blue-500',
      'Python': 'bg-green-500',
      'Java': 'bg-orange-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-gray-800',
      'C++': 'bg-pink-500',
      'C': 'bg-gray-600',
      'HTML': 'bg-orange-400',
      'CSS': 'bg-blue-400',
      'Ruby': 'bg-red-500',
      'PHP': 'bg-indigo-500',
    };
    return colors[language || ''] || 'bg-gray-400';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600">
          {repo.name}
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {repo.stars}
          </span>
          <span className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2A5 5 0 0011 9H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {repo.forks}
          </span>
        </div>
      </div>

      {repo.description && (
        <p className="text-gray-600 mb-3 line-clamp-2">{repo.description}</p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          {repo.language && (
            <div className="flex items-center space-x-1">
              <span className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
              <span className="text-sm text-gray-600">{repo.language}</span>
            </div>
          )}
          <span className="text-sm text-gray-500">
            更新: {formatDate(repo.updatedAt)}
          </span>
        </div>
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {repo.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoCard;

