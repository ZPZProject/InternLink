"use client";

import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import Link from "next/link";

export function StudentHeader({ total }: { total?: number }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          My Applications
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {total !== undefined
            ? `You have ${total} application${total !== 1 ? "s" : ""}.`
            : "Track the status of your internship applications."}
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/offers">
          <Icons.Briefcase className="mr-2 h-4 w-4" />
          Browse Offers
        </Link>
      </Button>
    </div>
  );
}

export function StudentOnboardingHeader({
  isComplete,
}: {
  isComplete: boolean;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {isComplete ? "Student Profile" : "Complete Your Profile"}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {isComplete
          ? "Your study details are on file. You can use the rest of the app."
          : "We need your school, index number, major, and year of study before you can browse offers and apply."}
      </p>
    </div>
  );
}
