import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressSteps({ currentStep, onStepClick }) {
  const steps = [
    { number: 1, title: 'Input Setup', desc: 'Select raster modality' },
    { number: 2, title: 'Validation', desc: 'Spatial & format checks' },
    { number: 3, title: 'Query', desc: 'Natural language prompt' },
    { number: 4, title: 'Agent Processing', desc: 'Autonomous workflow' },
    { number: 5, title: 'Results & Evidence', desc: 'Visual verification' },
  ];

  return (
    <div className="w-full py-4 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[580px] px-2">
        {steps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step indicator item */}
              <div
                onClick={() => isCompleted && onStepClick && onStepClick(step.number)}
                className={`flex items-center gap-3 select-none ${
                  isCompleted ? 'cursor-pointer group' : 'cursor-default'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-teal-500 dark:bg-[#4FD1C5] text-white dark:text-[#080B10] shadow-sm'
                      : isCurrent
                      ? 'bg-teal-500/10 dark:bg-[#4FD1C5]/10 text-teal-600 dark:text-[#4FD1C5] border-2 border-teal-500 dark:border-[#4FD1C5] scale-105'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>

                <div>
                  <p
                    className={`text-xs font-bold leading-none ${
                      isCurrent
                        ? 'text-teal-600 dark:text-[#4FD1C5]'
                        : isCompleted
                        ? 'text-gray-800 dark:text-gray-200 group-hover:text-teal-600'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Connector line between steps */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-4 h-[2px] bg-gray-200 dark:bg-white/10 relative overflow-hidden">
                  <div
                    className={`h-full bg-teal-500 dark:bg-[#4FD1C5] transition-all duration-500 ${
                      step.number < currentStep ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
