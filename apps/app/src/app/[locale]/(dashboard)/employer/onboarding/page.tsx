import { EmployerCompanyStatus } from "@/components/employer/employer-company-status";
import { EmployerOnboarding } from "@/components/employer/employer-onboarding";
import { caller } from "@/trpc/server";

export default async function EmployerOnboardingPage() {
  const membership = await caller.company.myMembership();

  if (membership) {
    return <EmployerCompanyStatus company={membership.company} />;
  }

  return <EmployerOnboarding />;
}
