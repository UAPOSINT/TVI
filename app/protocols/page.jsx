'use client';

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import Link from 'next/link';

export default function ProtocolsPage() {
  const { user } = useAuth();
  const [protocols] = useState([
    {
      id: 'TVI-001',
      title: 'Research Priority Protocol',
      category: 'GENERAL',
      content: 'Research and documentation take precedence over containment. All anomalous phenomena must be thoroughly studied and classified before any containment measures are considered.',
      severity: 'STANDARD'
    },
    {
      id: 'TVI-002',
      title: 'Non-Intervention Directive',
      category: 'FIELD',
      content: 'Direct intervention with anomalous phenomena should be minimized unless absolutely necessary. Observation and documentation are primary objectives.',
      severity: 'IMPORTANT'
    },
    {
      id: 'TVI-003',
      title: 'Emergency Containment Protocol',
      category: 'EMERGENCY',
      content: 'Containment measures are to be implemented only when an anomaly poses immediate and verified threat to civilian population or reality stability.',
      severity: 'CRITICAL'
    }
  ]);

  const severityColors = {
    STANDARD: 'text-green-500',
    IMPORTANT: 'text-amber-500',
    CRITICAL: 'text-red-500'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-tvi mb-2 text-amber-500">OPERATIONAL PROTOCOLS</h1>
      <p className="text-gray-400 mb-8 text-sm">Authorized by O5-01</p>

      <div className="mb-12">
        <Link 
          href="/protocols/classification"
          className="block border-2 border-amber-600 bg-black p-6 hover:bg-gray-900 transition-colors"
        >
          <h2 className="text-2xl font-tvi text-amber-500 mb-4">CLASSIFICATION SYSTEM</h2>
          <p className="text-gray-300 mb-4">
            Comprehensive terminology and classification framework for anomalous phenomena documentation and research.
            Adapted from proven methodologies to enhance clarity in high-strangeness research communication.
          </p>
          <div className="flex items-center text-amber-500">
            <span>ACCESS CLASSIFICATION GUIDE</span>
            <span className="ml-2">→</span>
          </div>
        </Link>
      </div>
      
      <h2 className="text-xl font-tvi text-amber-500 mb-6">CORE DIRECTIVES</h2>
      <div className="grid gap-6">
        {protocols.map(protocol => (
          <div key={protocol.id} className="border border-amber-600/30 bg-black p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-amber-500 font-mono block mb-2">
                  {protocol.id}
                </span>
                <h2 className="text-xl mb-1">{protocol.title}</h2>
              </div>
              <div className="flex gap-2">
                <span className="bg-amber-600/20 px-2 py-1 text-sm">
                  {protocol.category}
                </span>
                <span className={`px-2 py-1 text-sm ${severityColors[protocol.severity]}`}>
                  {protocol.severity}
                </span>
              </div>
            </div>
            <p className="text-gray-300">
              {protocol.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 