'use client';

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function TrainingPage() {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState(null);
  
  const trainingModules = [
    {
      id: 'T-001',
      title: 'Basic Field Operations',
      level: 1,
      duration: '2 weeks',
      status: 'MANDATORY',
      topics: [
        'Standard containment protocols',
        'Basic anomaly classification',
        'Emergency procedures',
        'Communication protocols'
      ]
    },
    {
      id: 'T-002',
      title: 'Advanced Containment',
      level: 2,
      duration: '4 weeks',
      status: 'REQUIRED',
      topics: [
        'Complex containment scenarios',
        'Reality stabilization techniques',
        'Psychic defense training',
        'Advanced security measures'
      ]
    },
    {
      id: 'T-003',
      title: 'Special Operations',
      level: 3,
      duration: '6 weeks',
      status: 'SPECIALIZED',
      topics: [
        'High-risk entity management',
        'Reality bending countermeasures',
        'Advanced tactical response',
        'Crisis management'
      ]
    }
  ];

  const levelColors = {
    1: 'border-green-500',
    2: 'border-amber-500',
    3: 'border-red-500'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-tvi mb-8 text-amber-500">FIELD AGENT TRAINING</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {trainingModules.map(module => (
            <div 
              key={module.id}
              onClick={() => setSelectedModule(module)}
              className={`cursor-pointer border-l-4 ${levelColors[module.level]} bg-black p-6 hover:bg-gray-900 transition-colors ${
                selectedModule?.id === module.id ? 'border-amber-600' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-amber-500 font-mono">
                  {module.id}
                </span>
                <span className="bg-amber-600/20 px-2 py-1 text-sm">
                  Level {module.level}
                </span>
              </div>
              <h2 className="text-xl mb-1">{module.title}</h2>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{module.duration}</span>
                <span>{module.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black border border-amber-600/30 p-6">
          {selectedModule ? (
            <>
              <h2 className="text-2xl font-tvi mb-4 text-amber-500">
                {selectedModule.title}
              </h2>
              <div className="mb-6">
                <h3 className="text-sm text-amber-500 mb-2">COURSE DETAILS</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <span className="ml-2">{selectedModule.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Level:</span>
                    <span className="ml-2">{selectedModule.level}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="ml-2">{selectedModule.status}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm text-amber-500 mb-2">CURRICULUM</h3>
                <ul className="space-y-2">
                  {selectedModule.topics.map((topic, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Select a training module to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 