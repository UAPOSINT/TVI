'use client';

import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function ClassificationPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('PHENOMENA');
  
  const classifications = {
    PHENOMENA: [
      {
        code: 'UAP',
        name: 'Unidentified Aerial Phenomena',
        description: 'Aerial objects or phenomena that defy conventional explanation.',
        subcategories: ['Luminous', 'Solid', 'Metamorphic', 'Trans-medium']
      },
      {
        code: 'TEP',
        name: 'Trans-Environmental Phenomena',
        description: 'Phenomena that operate across multiple environmental domains or appear to violate known physical laws.',
        subcategories: ['Phase-shift', 'Reality-bend', 'Domain-cross']
      },
      {
        code: 'PSI',
        name: 'Psychic/Consciousness Phenomena',
        description: 'Events or abilities related to non-physical consciousness interaction.',
        subcategories: ['Telepathic', 'Precognitive', 'Psychokinetic']
      }
    ],
    INTERACTION: [
      {
        code: 'INT',
        name: 'Interaction Level',
        description: 'Classification of direct interaction with human consciousness or physical reality.',
        levels: [
          'INT-0: Observational only',
          'INT-1: Indirect interaction',
          'INT-2: Direct non-physical interaction',
          'INT-3: Direct physical interaction',
          'INT-4: Reality-altering interaction'
        ]
      }
    ],
    THREAT: [
      {
        code: 'THR',
        name: 'Threat Assessment',
        description: 'Evaluation of potential risks to human consciousness, society, or reality stability.',
        levels: [
          'THR-1: Minimal risk - Observation only',
          'THR-2: Low risk - Documentation priority',
          'THR-3: Moderate risk - Active monitoring',
          'THR-4: High risk - Intervention planning',
          'THR-5: Critical risk - Immediate action'
        ]
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-tvi mb-2 text-amber-500">CLASSIFICATION SYSTEM</h1>
      <p className="text-gray-400 mb-8 text-sm">Authorized by O5-01</p>

      <div className="mb-8">
        <p className="text-gray-300">
          The Veil Institute Classification System (VICS) provides a standardized framework 
          for documenting and communicating about anomalous phenomena. This system prioritizes 
          research and understanding over containment, focusing on clear terminology and 
          accurate documentation.
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        {Object.keys(classifications).map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 font-mono ${
              activeCategory === category 
                ? 'bg-amber-600 text-black' 
                : 'border border-amber-600/30 hover:border-amber-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {classifications[activeCategory].map(classification => (
          <div key={classification.code} className="border border-amber-600/30 bg-black p-6">
            <div className="mb-4">
              <span className="text-amber-500 font-mono block mb-2">
                {classification.code}
              </span>
              <h2 className="text-xl mb-2">{classification.name}</h2>
              <p className="text-gray-300 mb-4">{classification.description}</p>
            </div>

            {classification.subcategories && (
              <div>
                <h3 className="text-sm text-amber-500 mb-2">SUBCATEGORIES</h3>
                <div className="grid grid-cols-2 gap-2">
                  {classification.subcategories.map(sub => (
                    <div key={sub} className="bg-gray-900 px-3 py-2 text-sm">
                      {sub}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {classification.levels && (
              <div>
                <h3 className="text-sm text-amber-500 mb-2">CLASSIFICATION LEVELS</h3>
                <div className="space-y-2">
                  {classification.levels.map(level => (
                    <div key={level} className="bg-gray-900 px-3 py-2 text-sm">
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 