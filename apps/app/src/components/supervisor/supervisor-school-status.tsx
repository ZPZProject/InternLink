"use client";

import { Button } from "@v1/ui/button";
import Link from "next/link";

type School = {
  id: string;
  name: string;
  approval_status: "pending" | "approved" | "rejected";
};

export function SupervisorSchoolStatus({ school }: { school: School }) {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">School</h1>
      <p className="text-muted-foreground text-sm">
        You are linked to{" "}
        <span className="text-foreground font-medium">{school.name}</span>.
      </p>
      <p className="text-sm">
        Status:{" "}
        <span className="font-medium capitalize">{school.approval_status}</span>
      </p>
      {school.approval_status === "pending" ? (
        <p className="text-muted-foreground text-sm">
          An administrator still needs to approve this school or university.
        </p>
      ) : null}
      {school.approval_status === "rejected" ? (
        <p className="text-muted-foreground text-sm">
          This school was not approved. Contact an administrator if you need
          your account linked to a different institution.
        </p>
      ) : null}
      <Button asChild variant="outline" size="sm">
        <Link href="/home">Home</Link>
      </Button>
    </div>
  );
}
