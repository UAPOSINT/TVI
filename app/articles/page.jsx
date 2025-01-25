'use client';

import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ArticlesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('RECENT');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();
        setArticles(data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const categories = {
    ALL: 'All Documents',
    ARTICLE: 'Field Reports',
    RESEARCH: 'Research Papers',
    GOI: 'Groups of Interest',
    POI: 'Persons of Interest'
  };

  const categoryColors = {
    ARTICLE: 'border-green-500',
    RESEARCH: 'border-blue-500',
    GOI: 'border-purple-500',
    POI: 'border-amber-500'
  };

  const handleNewEntry = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login?redirect=/articles/new');
      return;
    }
    router.push('/articles/new');
  };

  const filteredArticles = articles.filter(article => {
    if (activeCategory !== 'ALL' && article.document_type !== activeCategory) return false;
    
    const searchTerms = searchQuery.toLowerCase().split(' ');
    return searchTerms.every(term =>
      article.title.toLowerCase().includes(term) ||
      article.content.toLowerCase().includes(term) ||
      article.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  });

  if (sortOrder === 'RECENT') {
    filteredArticles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header with New Entry Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-tvi text-amber-500">ARCHIVES</h1>
        <button
          onClick={handleNewEntry}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-700 transition-colors font-semibold text-sm flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          NEW ENTRY
        </button>
      </div>

      {/* Quick Start Guide */}
      {articles.length === 0 && !loading && (
        <div className="mb-8 p-6 bg-black border border-amber-600/30">
          <h2 className="text-xl font-tvi text-amber-500 mb-4">Welcome to the Archives</h2>
          <p className="text-gray-300 mb-4">
            The Archives contain all documented phenomena, research papers, and profiles. 
            Get started by creating your first entry.
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Field Reports: Document observed phenomena and incidents</p>
            <p>• Research Papers: Share detailed analysis and findings</p>
            <p>• Groups of Interest: Profile organizations and collectives</p>
            <p>• Persons of Interest: Document significant individuals</p>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search archives..."
            className="flex-1 px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="RECENT">Most Recent</option>
            <option value="ALPHA">Alphabetical</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 text-sm ${
                activeCategory === key
                  ? 'bg-amber-600 text-black'
                  : 'border border-amber-600/30 hover:border-amber-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-amber-500">Loading archives...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredArticles.map(article => (
            <div 
              key={article.article_id}
              onClick={() => router.push(`/articles/${article.article_id}`)}
              className={`border-l-4 ${categoryColors[article.document_type]} bg-black p-6 cursor-pointer hover:bg-gray-900 transition-colors`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-amber-500 font-mono text-sm">
                      {article.document_type}-{article.article_id.slice(0,4)}
                    </span>
                    <span className="bg-amber-600/20 px-2 py-1 text-xs">
                      Level {article.classification_level}
                    </span>
                    <span className="bg-gray-800 px-2 py-1 text-xs">
                      {article.status}
                    </span>
                  </div>
                  <h2 className="text-xl mb-2">{article.title}</h2>
                  <p className="text-gray-300 line-clamp-2">{article.content}</p>
                </div>
                <span className="text-gray-500 text-sm">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No entries found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
} 