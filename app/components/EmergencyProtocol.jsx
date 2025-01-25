'use client';

import { useState } from 'react';
import Modal from './Modal';

export default function EmergencyProtocol({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  
  const steps = [
    {
      title: 'CONTAINMENT BREACH DETECTED',
      content: 'Initiating emergency protocols. Please stand by for further instructions.',
      action: 'ACKNOWLEDGE'
    },
    {
      title: 'SECURITY MEASURES',
      content: 'All personnel must immediately report to their designated safe zones. Maintain radio silence unless absolutely necessary.',
      action: 'CONFIRM'
    },
    {
      title: 'LOCKDOWN PROCEDURES',
      content: 'Facility-wide lockdown initiated. All non-essential systems will be terminated. Emergency power only.',
      action: 'CLOSE'
    }
  ];

  const currentStep = steps[step - 1];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      setStep(1);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="EMERGENCY PROTOCOL"
    >
      <div className="text-center">
        <div className="animate-pulse mb-6">
          <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2" />
          <p className="text-red-500 font-mono">ALERT LEVEL {step}</p>
        </div>
        
        <h3 className="text-2xl font-tvi mb-4 text-amber-500">
          {currentStep.title}
        </h3>
        
        <p className="text-gray-300 mb-8">
          {currentStep.content}
        </p>

        <button
          onClick={handleNext}
          className="bg-amber-600 px-6 py-2 font-mono hover:bg-amber-700 transition-colors"
        >
          {currentStep.action}
        </button>
      </div>
    </Modal>
  );
} 