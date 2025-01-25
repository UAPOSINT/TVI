'use client';

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function ResearchPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ONGOING');
  
  const research = {
    ONGOING: [
      {
        id: 'R-001',
        title: 'Temporal Anomaly Analysis',
        lead: 'Dr. Sarah Chen',
        status: 'ACTIVE',
        priority: 'HIGH',
        description: 'Investigation into localized time dilation effects observed in Sector 7.'
      },
      {
        id: 'R-002',
        title: 'Psychic Resonance Mapping',
        lead: 'Dr. Marcus Webb',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        description: 'Studying the collective consciousness patterns of telepathically linked entities.'
      }
    ],
    COMPLETED: [
      {
        id: 'R-003',
        title: 'Dimensional Barrier Strength',
        lead: 'Dr. Elena Santos',
        status: 'COMPLETED',
        priority: 'ARCHIVED',
        description: 'Successfully mapped and reinforced weak points in local dimensional barriers.'
      }
    ],
    PROPOSED: [
      {
        id: 'R-004',
        title: 'Reality Anchor Development',
        lead: 'Dr. James Morrison',
        status: 'PENDING',
        priority: 'CRITICAL',
        description: 'Proposal to develop more efficient reality anchors for unstable anomalies.'
      }
    ]
  };

  const priorityColors = {
    HIGH: 'text-red-500',
    MEDIUM: 'text-amber-500',
    LOW: 'text-green-500',
    CRITICAL: 'text-purple-500',
    ARCHIVED: 'text-gray-500'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-tvi mb-8 text-amber-500">RESEARCH INITIATIVES</h1>
      
      <div className="flex gap-4 mb-8">
        {Object.keys(research).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-mono ${
              activeTab === tab 
                ? 'bg-amber-600 text-black' 
                : 'border border-amber-600/30 hover:border-amber-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {research[activeTab].map(project => (
          <div key={project.id} className="border border-amber-600/30 bg-black p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-amber-500 font-mono block mb-2">
                  {project.id}
                </span>
                <h2 className="text-xl mb-1">{project.title}</h2>
                <p className="text-sm text-gray-400">Lead: {project.lead}</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-amber-600/20 px-2 py-1 text-sm">
                  {project.status}
                </span>
                <span className={`px-2 py-1 text-sm ${priorityColors[project.priority]}`}>
                  {project.priority}
                </span>
              </div>
            </div>
            <p className="text-gray-300">
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 