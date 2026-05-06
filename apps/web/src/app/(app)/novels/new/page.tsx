"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout } from "@/components/wizard/wizard-layout";
import { StepBasics } from "@/components/wizard/step-basics";
import { StepCharacters } from "@/components/wizard/step-characters";
import { StepSettings } from "@/components/wizard/step-settings";
import { StepChapters } from "@/components/wizard/step-chapters";
import { StepConfirm } from "@/components/wizard/step-confirm";
import { useWizardStore } from "@/stores/wizard-store";
import { novelService } from "@/services/novel.service";
import { characterService } from "@/services/character.service";
import { settingService } from "@/services/setting.service";
import { chapterService } from "@/services/chapter.service";
import { toast } from "sonner";

export default function NewNovelPage() {
  const router = useRouter();
  const store = useWizardStore();
  const [loading, setLoading] = useState(false);

  const validateCurrentStep = useCallback(() => {
    switch (store.currentStep) {
      case 1:
        return (
          store.title.trim().length > 0 &&
          store.genre.length > 0 &&
          store.premise.trim().length > 0 &&
          store.synopsis.trim().length > 0
        );
      case 2:
      case 3:
        return true;
      case 4:
        return (
          store.chapters.length > 0 &&
          store.chapters.some((c) => c.title.trim().length > 0)
        );
      case 5:
        return true;
      default:
        return false;
    }
  }, [store]);

  function handleNext() {
    if (store.currentStep < 5) {
      store.setStep(store.currentStep + 1);
    }
  }

  function handlePrev() {
    if (store.currentStep > 1) {
      store.setStep(store.currentStep - 1);
    }
  }

  function handleCancel() {
    store.reset();
    router.push("/dashboard");
  }

  async function handleSubmit() {
    setLoading(true);

    const novelResult = await novelService.create({
      title: store.title,
      genre: store.genre,
      premise: store.premise,
      synopsis: store.synopsis,
    });

    if (!novelResult.success || !novelResult.data) {
      setLoading(false);
      toast.error(novelResult.error || "Gagal membuat novel");
      return;
    }

    const novelId = novelResult.data.id;

    for (const char of store.characters) {
      await characterService.create(novelId, {
        name: char.name,
        description: char.description,
      });
    }

    for (const setting of store.settings) {
      await settingService.create(novelId, {
        name: setting.name,
        description: setting.description,
      });
    }

    for (let i = 0; i < store.chapters.length; i++) {
      const ch = store.chapters[i];
      await chapterService.create(novelId, {
        title: ch.title,
        outline: ch.outline || undefined,
        order_index: i,
      });
    }

    setLoading(false);
    store.reset();
    toast.success("Novel berhasil dibuat!");
    router.push(`/novels/${novelId}`);
  }

  return (
    <WizardLayout
      currentStep={store.currentStep}
      visitedSteps={store.visitedSteps}
      onStepClick={store.setStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      loading={loading}
      canGoNext={validateCurrentStep()}
    >
      {store.currentStep === 1 && (
        <StepBasics
          title={store.title}
          genre={store.genre}
          premise={store.premise}
          synopsis={store.synopsis}
          onChange={store.setBasics}
          onValidationChange={() => {}}
        />
      )}

      {store.currentStep === 2 && (
        <StepCharacters
          characters={store.characters}
          onAdd={store.addCharacter}
          onUpdate={store.updateCharacter}
          onRemove={store.removeCharacter}
        />
      )}

      {store.currentStep === 3 && (
        <StepSettings
          settings={store.settings}
          onAdd={store.addSetting}
          onUpdate={store.updateSetting}
          onRemove={store.removeSetting}
        />
      )}

      {store.currentStep === 4 && (
        <StepChapters
          chapters={store.chapters}
          onAdd={store.addChapter}
          onUpdate={store.updateChapter}
          onRemove={store.removeChapter}
          onReorder={store.reorderChapters}
        />
      )}

      {store.currentStep === 5 && (
        <StepConfirm
          title={store.title}
          genre={store.genre}
          premise={store.premise}
          synopsis={store.synopsis}
          characters={store.characters}
          settings={store.settings}
          chapters={store.chapters}
          onGoToStep={store.setStep}
        />
      )}
    </WizardLayout>
  );
}
