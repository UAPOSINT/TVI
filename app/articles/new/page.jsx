'use client';

import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from '../../../components/RichTextEditor';

export default function NewArticlePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [terms, setTerms] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    document_type: 'ARTICLE',
    classification_level: 1,
    object_class: 'STANDARD',
    tags: []
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/login?redirect=/articles/new');
      return;
    }

    // Fetch glossary terms for auto-linking
    const fetchTerms = async () => {
      try {
        const res = await fetch('/api/glossary/terms');
        if (!res.ok) throw new Error('Failed to fetch terms');
        const data = await res.json();
        setTerms(data);
      } catch (error) {
        console.error('Error fetching terms:', error);
        setError('Failed to load glossary terms');
      }
    };
    fetchTerms();
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit article');
      }
      
      const data = await res.json();
      router.push(`/articles/${data.article_id}`);
    } catch (error) {
      console.error('Error submitting article:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = {
    ARTICLE: 'Field Report',
    RESEARCH: 'Research Paper',
    GOI: 'Group of Interest',
    POI: 'Person of Interest'
  };

  const objectClasses = [
    'STANDARD',
    'SENSITIVE',
    'RESTRICTED',
    'CLASSIFIED'
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/articles" className="text-amber-500 hover:text-amber-400">
          ← Back to Archives
        </Link>
      </div>

      <div className="bg-black border border-amber-600/30 p-8">
        <h1 className="text-3xl font-tvi text-amber-500 mb-8">NEW ENTRY</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-amber-500 mb-2">DOCUMENT TYPE</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                className="w-full px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
              >
                {Object.entries(documentTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-amber-500 mb-2">OBJECT CLASS</label>
              <select
                value={formData.object_class}
                onChange={(e) => setFormData(prev => ({ ...prev, object_class: e.target.value }))}
                className="w-full px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
              >
                {objectClasses.map(classType => (
                  <option key={classType} value={classType}>{classType}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-amber-500 mb-2">TITLE</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
              placeholder="Enter document title..."
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm text-amber-500 mb-2">CONTENT</label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              glossaryTerms={terms}
              className="min-h-[400px] border border-amber-600/30"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-amber-500 mb-2">TAGS</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
              className="w-full px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
              placeholder="Enter tags separated by commas..."
            />
          </div>

          {/* Classification Level */}
          <div>
            <label className="block text-sm text-amber-500 mb-2">CLASSIFICATION LEVEL</label>
            <select
              value={formData.classification_level}
              onChange={(e) => setFormData(prev => ({ ...prev, classification_level: parseInt(e.target.value) }))}
              className="w-full px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-amber-600 hover:bg-amber-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 