'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function GlossaryPage() {
  const { user } = useAuth();
  const [terms, setTerms] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchTerms = async () => {
      const res = await fetch('/api/glossary');
      const data = await res.json();
      setTerms(data);
    };
    fetchTerms();
  }, []);

  const filteredTerms = terms.filter(term => 
    term.term.toLowerCase().includes(filter.toLowerCase()) ||
    term.definition.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-tvi mb-8 text-amber-500">GLOSSARY</h1>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search terms..."
          className="w-full max-w-md px-4 py-2 bg-black border border-amber-600/30 text-gray-100 focus:border-amber-600 focus:outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid gap-6">
        {filteredTerms.map(term => (
          <div key={term.id} className="border border-amber-600/30 bg-black p-6">
            <h2 className="text-xl text-amber-500 mb-2 font-mono">{term.term}</h2>
            <p className="text-gray-300">{term.definition}</p>
            {term.classification_level > 1 && (
              <div className="mt-2 text-sm text-amber-600">
                Clearance Level Required: {term.classification_level}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 