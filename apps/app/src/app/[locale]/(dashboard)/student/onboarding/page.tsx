import type { Tables } from "@v1/supabase/types";
import { StudentOnboardingForm } from "@/components/student/student-onboarding-form";
import { StudentProfileComplete } from "@/components/student/student-profile-complete";
import { caller } from "@/trpc/server";

function isStudentOnboardingComplete(
  row: Tables<"student_profiles"> | null,
): boolean {
  if (!row) return false;
  if (!row.school_id) return false;
  const index = row.index_number?.trim() ?? "";
  const major = row.major?.trim() ?? "";
  const year = row.year_of_study;
  if (index.length === 0 || major.length === 0) return false;
  if (year === null || year === undefined) return false;
  return Number.isInteger(year) && year >= 1 && year <= 6;
}

export default async function StudentOnboardingPage() {
  const profile = await caller.student.myProfile();

  if (isStudentOnboardingComplete(profile)) {
    return <StudentProfileComplete />;
  }

  return <StudentOnboardingForm initial={profile} />;
}
