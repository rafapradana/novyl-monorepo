"use client";

import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Dasar" },
  { number: 2, label: "Karakter" },
  { number: 3, label: "Latar" },
  { number: 4, label: "Bab" },
  { number: 5, label: "Konfirmasi" },
];

interface StepIndicatorProps {
  currentStep: number;
  visitedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  visitedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isVisited = visitedSteps.has(step.number);
        const isClickable = isVisited || isCompleted;

        return (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "border-2 border-indigo-600 bg-indigo-600 text-white"
                      : "border-2 border-gray-300 text-gray-400"
                } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-xs ${
                  isActive
                    ? "font-semibold text-indigo-600"
                    : isCompleted
                      ? "text-green-600"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 transition-colors ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
