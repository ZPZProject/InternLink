import { SupervisorOnboarding } from "@/components/supervisor/supervisor-onboarding";
import { SupervisorSchoolStatus } from "@/components/supervisor/supervisor-school-status";
import { caller } from "@/trpc/server";

export default async function SupervisorOnboardingPage() {
  const membership = await caller.school.myMembership();

  if (membership) {
    return <SupervisorSchoolStatus school={membership.school} />;
  }

  return <SupervisorOnboarding />;
}
