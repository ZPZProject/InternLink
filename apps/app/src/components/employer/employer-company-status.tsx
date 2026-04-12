"use client";

import { Button } from "@v1/ui/button";
import Link from "next/link";

type Company = {
  id: string;
  name: string;
  approval_status: "pending" | "approved" | "rejected";
};

export function EmployerCompanyStatus({ company }: { company: Company }) {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Company</h1>
      <p className="text-muted-foreground text-sm">
        You are linked to{" "}
        <span className="text-foreground font-medium">{company.name}</span>.
      </p>
      <p className="text-sm">
        Status:{" "}
        <span className="font-medium capitalize">
          {company.approval_status}
        </span>
      </p>
      {company.approval_status === "pending" ? (
        <p className="text-muted-foreground text-sm">
          An administrator still needs to approve this company.
        </p>
      ) : null}
      {company.approval_status === "rejected" ? (
        <p className="text-muted-foreground text-sm">
          This company was not approved. Contact an administrator if you need
          your account linked to a different company.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/home">Home</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/employer/offers">My offers</Link>
        </Button>
      </div>
    </div>
  );
}
