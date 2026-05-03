import { ApplicationList } from "@/components/applications/application-list";
import { StudentHeader } from "@/components/student/student-header";
import { StudentStats } from "@/components/student/student-stats";

export default function StudentApplicationsPage() {
  return (
    <div className="space-y-6">
      <StudentHeader />
      <StudentStats />
      <ApplicationList />
    </div>
  );
}