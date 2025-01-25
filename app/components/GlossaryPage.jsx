import { useState } from 'react';
import { searchTerms } from '../utils/searchService';

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const terms = await searchTerms(searchQuery);
    setResults(terms);
  };

  return (
    <div className="glossary-container max-w-4xl mx-auto p-6">
      <div className="glossary-header mb-8 text-center">
        <h1 className="text-4xl font-scp font-bold">COSSerary</h1>
        <form onSubmit={handleSearch} className="search-box mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terminology..."
            className="w-full p-3 border-2 border-black"
          />
        </form>
      </div>

      <div className="term-grid grid gap-4">
        {results.map(term => (
          <div key={term.term_id} className="term-card bg-white p-4 shadow-md">
            <h3 className="text-xl font-scp font-bold mb-2">{term.term}</h3>
            <div className="definition" 
                 dangerouslySetInnerHTML={{ __html: term.official_definition }} />
            {term.related_articles.length > 0 && (
              <div className="related-articles mt-3">
                <h4 className="font-bold">Related Documents:</h4>
                <ul className="list-disc pl-5">
                  {term.related_articles.map(article => (
                    <li key={article}>{article.document_type}-{article.article_id.slice(0,4)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 