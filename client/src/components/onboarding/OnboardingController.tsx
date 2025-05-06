import { OnboardingWizard } from "./OnboardingWizard";
import { useOnboarding } from "@/hooks/use-onboarding";

export function OnboardingController() {
  const { isOnboardingVisible, hideOnboarding, completeOnboarding } = useOnboarding();

  if (!isOnboardingVisible) {
    return null;
  }

  return (
    <OnboardingWizard
      onComplete={completeOnboarding}
      onSkip={hideOnboarding}
    />
  );
}