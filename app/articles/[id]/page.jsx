'use client';

import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkToc from 'remark-toc';

export default function ArticlePage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renderedContent, setRenderedContent] = useState('');
  const [toc, setToc] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch article');
        const data = await res.json();
        setArticle(data);
        
        // Extract headings for TOC
        const headings = [];
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const matches = data.content.matchAll(headingRegex);
        for (const match of matches) {
          const level = match[1].length;
          const text = match[2];
          const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          headings.push({ level, text, slug });
        }
        setToc(headings);

        // Add TOC to content if it doesn't exist
        let contentWithToc = data.content;
        if (!contentWithToc.includes('## Table of Contents')) {
          contentWithToc = '## Table of Contents\n\n' + contentWithToc;
        }

        // Process markdown content
        const result = await unified()
          .use(remarkParse)
          .use(rehypeSlug)
          .use(remarkToc, {
            heading: 'Table of Contents',
            tight: true,
            maxDepth: 3
          })
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkRehype)
          .use(rehypeRaw)
          .use(rehypeKatex)
          .use(rehypeStringify)
          .process(contentWithToc);

        // Process glossary terms and section references
        let processedContent = String(result);
        
        // Process glossary terms
        data.relatedTerms?.forEach(term => {
          const regex = new RegExp(`\\[\\[${term.term}\\]\\]`, 'g');
          processedContent = processedContent.replace(
            regex,
            `<a href="/glossary/${term.slug}" class="glossary-term" data-term="${term.term_id}">${term.term}</a>`
          );
        });

        // Process section references
        processedContent = processedContent.replace(
          /\[\[#(.*?)\]\]/g,
          (match, section) => {
            const slug = section.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return `<a href="#${slug}" class="section-link">${section}</a>`;
          }
        );

        setRenderedContent(processedContent);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  const handleTermClick = (term) => {
    router.push(`/glossary?term=${encodeURIComponent(term)}`);
  };

  const handleSectionClick = (slug) => {
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="text-amber-500">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="text-red-500">Error loading article: {error}</div>
        <Link href="/articles" className="text-amber-500 hover:text-amber-400 mt-4 inline-block">
          Return to Archives
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/articles" className="text-amber-500 hover:text-amber-400">
          ← Back to Archives
        </Link>
      </div>

      <article className="bg-black border border-amber-600/30 p-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-amber-500 font-mono">
              {article.document_type}-{article.article_id.slice(0,4)}
            </span>
            <span className="bg-amber-600/20 px-2 py-1 text-xs">
              Level {article.classification_level}
            </span>
            <span className="bg-gray-800 px-2 py-1 text-xs">
              {article.status}
            </span>
          </div>
          <h1 className="text-3xl font-tvi text-amber-500 mb-4">{article.title}</h1>
          <div className="text-gray-400 text-sm">
            By {article.author.username} • {new Date(article.created_at).toLocaleDateString()}
          </div>
        </header>

        {/* Quick Navigation */}
        <div className="mb-8 p-4 bg-gray-900 border border-amber-600/30 rounded">
          <h3 className="text-amber-500 text-sm mb-3">QUICK NAVIGATION</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {toc.map((heading, index) => (
              <button
                key={index}
                onClick={() => handleSectionClick(heading.slug)}
                className={`text-left px-2 py-1 hover:bg-gray-800 rounded text-sm ${
                  heading.level === 1 ? 'font-bold' :
                  heading.level === 2 ? 'ml-4' : 'ml-8'
                }`}
              >
                {heading.text}
              </button>
            ))}
          </div>
        </div>

        <div 
          className="prose prose-invert max-w-none mb-8 markdown-content" 
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        {article.relatedTerms?.length > 0 && (
          <section className="border-t border-amber-600/30 pt-6 mt-8">
            <h2 className="text-amber-500 text-sm mb-3">RELATED TERMS</h2>
            <div className="flex flex-wrap gap-2">
              {article.relatedTerms.map(term => (
                <button
                  key={term.term_id}
                  onClick={() => handleTermClick(term.term)}
                  className="text-amber-500 hover:text-amber-400 text-sm underline"
                >
                  {term.term}
                </button>
              ))}
            </div>
          </section>
        )}

        {article.comments?.length > 0 && (
          <section className="border-t border-amber-600/30 pt-6 mt-8">
            <h2 className="text-amber-500 text-sm mb-3">COMMENTS</h2>
            <div className="space-y-4">
              {article.comments.map(comment => (
                <div key={comment.id} className="bg-gray-900 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-amber-500">{comment.user}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{comment.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Classification: {comment.classification}
                    </span>
                    <span className="text-xs text-gray-500">
                      Votes: {comment.net_votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      <style jsx global>{`
        .markdown-content {
          font-family: 'Fira Code', monospace;
        }
        .markdown-content pre {
          background-color: #1f2937;
          padding: 1em;
          border-radius: 4px;
        }
        .markdown-content code {
          background-color: #374151;
          padding: 0.2em 0.4em;
          border-radius: 3px;
        }
        .markdown-content blockquote {
          border-left: 4px solid #d97706;
          padding-left: 1em;
          color: #9ca3af;
        }
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          scroll-margin-top: 5rem;
        }
        .glossary-term {
          color: #d97706;
          text-decoration: none;
          border-bottom: 1px dashed #d97706;
        }
        .glossary-term:hover {
          color: #f59e0b;
        }
        .section-link {
          color: #d97706;
          text-decoration: none;
          border-bottom: 1px solid #d97706;
        }
        .section-link:hover {
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
} 