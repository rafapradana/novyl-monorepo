"use client";

import { useRouter } from "next/navigation";
import { X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./step-indicator";

interface WizardLayoutProps {
  currentStep: number;
  visitedSteps: Set<number>;
  onStepClick: (step: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onCancel: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  canGoNext?: boolean;
  children: React.ReactNode;
}

export function WizardLayout({
  currentStep,
  visitedSteps,
  onStepClick,
  onNext,
  onPrev,
  onCancel,
  onSubmit,
  loading = false,
  canGoNext = true,
  children,
}: WizardLayoutProps) {
  const router = useRouter();
  const isLastStep = currentStep === 5;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="text-lg font-bold text-indigo-600">Novyl</span>

          {/* Progress Bar */}
          <div className="mx-6 flex-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-[680px] flex-1 px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator
            currentStep={currentStep}
            visitedSteps={visitedSteps}
            onStepClick={onStepClick}
          />
        </div>

        {/* Step Content */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {children}
        </div>
      </main>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[680px] items-center justify-between px-4 py-4">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>

          {isLastStep ? (
            <Button onClick={onSubmit} disabled={loading || !canGoNext}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                "Buat Novel"
              )}
            </Button>
          ) : (
            <Button onClick={onNext} disabled={!canGoNext}>
              Lanjut
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
