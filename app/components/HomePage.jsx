'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import EmergencyProtocol from './EmergencyProtocol';

export default function HomePage() {
  const { user } = useAuth();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [recentArticles, setRecentArticles] = useState([]);
  const [showEmergency, setShowEmergency] = useState(false);
  
  useEffect(() => {
    const loadRecent = async () => {
      const res = await fetch('/api/articles/recent');
      const data = await res.json();
      setRecentArticles(data);
    };
    loadRecent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Status Header Bar */}
      <div className="bg-black py-2 px-4 flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <span>STATUS: <span className="text-green-500">SECURE</span></span>
          <span>CONTAINMENT: <span className="text-amber-500">NOMINAL</span></span>
        </div>
        <div className="flex gap-4">
          {user ? (
            <>
              <span>CLEARANCE: LEVEL {user.classification_level}</span>
              <Link href="/dashboard" className="text-amber-500 hover:text-amber-400">
                DASHBOARD
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-amber-500 hover:text-amber-400">
              IDENTIFY
            </Link>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-amber-600">
        <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-3xl font-tvi font-bold tracking-tighter">
            THE VEIL INSTITUTE
            <span className="block text-sm font-normal mt-1">
              Ad Scientiam Occultam
            </span>
          </Link>
          
          <div className="flex gap-8">
            <Link href="/articles" className="hover:text-amber-500 transition-colors">
              ARCHIVES
            </Link>
            <Link href="/glossary" className="hover:text-amber-500 transition-colors">
              GLOSSARY
            </Link>
            {user?.classification_level >= 5 && (
              <Link href="/admin" className="text-red-400 hover:text-red-300">
                O5 COMMAND
              </Link>
            )}
          </div>

          <button 
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </nav>
      </header>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 p-4">
          <div className="flex flex-col gap-4">
            <Link href="/articles">ARCHIVES</Link>
            <Link href="/glossary">GLOSSARY</Link>
            {user?.classification_level >= 5 && (
              <Link href="/admin">O5 COMMAND</Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Directives Shield */}
        <div className="relative w-full flex justify-center items-center py-12">
          <div className="w-full max-w-[800px] aspect-[2/1] relative">
            <svg
              viewBox="0 0 600 300"
              className="absolute inset-0 w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M300 20L550 80V140C550 220 440 260 300 280C160 260 50 220 50 140V80L300 20Z"
                fill="black"
                stroke="#D97706"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center">
              <div className="text-amber-500 font-mono text-xs sm:text-sm mb-2 sm:mb-4">TVI DIRECTIVES</div>
              <div className="space-y-2 sm:space-y-3 max-w-lg mb-4 sm:mb-6">
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="text-amber-500">RESEARCH:</span> Document and understand anomalous phenomena
                </p>
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="text-amber-500">CLASSIFY:</span> Maintain precise terminology and clear communication
                </p>
                <p className="text-gray-300 text-xs sm:text-sm">
                  <span className="text-amber-500">PROTECT:</span> Intervene only when absolutely necessary
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm">
                <Link href="/protocols" className="text-amber-500 hover:text-amber-400 transition-colors">
                  CONTAINMENT PROTOCOLS
                </Link>
                <Link href="/research" className="text-amber-500 hover:text-amber-400 transition-colors">
                  RESEARCH INITIATIVES
                </Link>
                <Link href="/training" className="text-amber-500 hover:text-amber-400 transition-colors">
                  FIELD AGENT TRAINING
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <main className="relative flex items-center justify-center bg-gradient-to-b from-black to-gray-900 min-h-[50vh] lg:min-h-[40vh] py-12">
          <div className="text-center w-full max-w-4xl px-4">
            <div className="border-2 border-amber-600 p-4 sm:p-6 lg:p-8 bg-black bg-opacity-50">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-tvi mb-3 sm:mb-4 tracking-tighter">
                SECURING THE UNKNOWN
              </h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-gray-300">
                Dedicated to the research, containment, and protection of anomalous phenomena
              </p>
              <div className="flex justify-center gap-4">
                <Link 
                  href="/articles" 
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-amber-600 hover:bg-amber-700 transition-colors font-semibold text-sm sm:text-base"
                >
                  ACCESS ARCHIVES
                </Link>
                {user?.classification_level >= 2 && (
                  <Link 
                    href="/submit" 
                    className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-amber-600 hover:bg-amber-600/10 transition-colors text-sm sm:text-base"
                  >
                    SUBMIT REPORT
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Featured Section */}
        <section className="max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 lg:py-16">
          <h3 className="text-xl sm:text-2xl font-tvi mb-6 sm:mb-8 border-l-4 border-amber-600 pl-4">
            RECENTLY UPDATED
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {recentArticles.map(article => (
              <div key={article.article_id} className="border border-amber-600/30 bg-black p-4 sm:p-6">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <span className="text-amber-500 font-mono text-sm">
                    {article.document_type}-{article.article_id.slice(0,4)}
                  </span>
                  <span className="bg-amber-600/20 px-2 py-1 text-xs">
                    {article.object_class}
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl mb-2">{article.title}</h4>
                <p className="text-gray-400 text-sm line-clamp-3">
                  {article.content.substring(0, 150)}...
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-amber-600/30 mt-auto py-6 sm:py-8 px-4">
          <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
              <div>
                <h4 className="text-amber-500 mb-2 text-xs sm:text-sm">ORGANIZATION</h4>
                <p className="text-xs">THE VEIL INSTITUTE<br />EST. 1947</p>
              </div>
              <div>
                <h4 className="text-amber-500 mb-2 text-xs sm:text-sm">SECURE CHANNELS</h4>
                <ul className="space-y-1 text-xs">
                  <li><Link href="/alert" className="hover:text-amber-500">Threat Level Status</Link></li>
                  <li><Link href="/briefing" className="hover:text-amber-500">Daily Briefing</Link></li>
                  <li>
                    <button 
                      onClick={() => setShowEmergency(true)} 
                      className="text-amber-500 hover:text-amber-400"
                    >
                      Breach Protocol
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-amber-600/20 pt-4 sm:pt-6">
              <p className="text-[10px] sm:text-xs text-amber-600/50">
                WARNING: Unauthorized access to TVI systems is punishable by<br />
                immediate termination under Global Occult Initiative Statute 7
              </p>
              <div className="mt-3 sm:mt-4 flex justify-center gap-4">
                <Link href="/privacy" className="text-amber-600/50 hover:text-amber-600/70 text-[10px] sm:text-xs">
                  Security Policy
                </Link>
                <span className="text-amber-600/50">|</span>
                <Link href="/clearance" className="text-amber-600/50 hover:text-amber-600/70 text-[10px] sm:text-xs">
                  Clearance Verification
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <EmergencyProtocol 
        isOpen={showEmergency} 
        onClose={() => setShowEmergency(false)} 
      />
    </div>
  );
}