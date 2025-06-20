import React, { useState, useMemo } from 'react';
import { Search, Hash, TrendingUp, Users, Plus, Check } from 'lucide-react';
import { AppState, HashtagData } from '../types';

interface HashtagSearchProps {
  state: AppState;
  onSelectHashtag: (hashtag: string) => void;
  onFollowHashtag: (hashtag: string) => void;
}

export const HashtagSearch: React.FC<HashtagSearchProps> = ({
  state,
  onSelectHashtag,
  onFollowHashtag
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHashtags = useMemo(() => {
    if (!searchTerm) {
      return state.hashtags.sort((a, b) => b.count - a.count);
    }
    return state.hashtags.filter(hashtag =>
      hashtag.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.hashtags, searchTerm]);

  const trendingHashtags = useMemo(() => {
    return state.hashtags
      .filter(h => h.trending)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [state.hashtags]);

  const isFollowing = (hashtag: string) => {
    return state.currentUser?.followedHashtags.includes(hashtag) || false;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Explore Hashtags</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hashtags..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trending Hashtags */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Trending</h2>
            </div>
            <div className="space-y-3">
              {trendingHashtags.map((hashtag, index) => (
                <div
                  key={hashtag.tag}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => onSelectHashtag(hashtag.tag)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-purple-600">#{hashtag.tag}</p>
                      <p className="text-sm text-gray-500">{hashtag.count} posts</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollowHashtag(hashtag.tag);
                    }}
                    className={`p-1 rounded-full transition-colors ${
                      isFollowing(hashtag.tag)
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    {isFollowing(hashtag.tag) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Hashtags */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {searchTerm ? `Results for "${searchTerm}"` : 'All Hashtags'}
            </h2>
            <div className="grid gap-4">
              {filteredHashtags.map((hashtag) => (
                <div
                  key={hashtag.tag}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectHashtag(hashtag.tag)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">#{hashtag.tag}</h3>
                        {hashtag.trending && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                            Trending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{hashtag.count} posts</span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{hashtag.followers.length} followers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollowHashtag(hashtag.tag);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing(hashtag.tag)
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {isFollowing(hashtag.tag) ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};