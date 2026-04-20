"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import { useTRPC } from "@/trpc/react";
import { AcceptRejectApplicationActions } from "./accept-reject-application-actions";

const statusVariant: Record<
  string,
  "blue" | "destructive" | "amber" | "secondary"
> = {
  pending: "amber",
  accepted: "blue",
  rejected: "destructive",
  withdrawn: "secondary",
};

export function EmployerApplicationList({ offerId }: { offerId: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.applications.byOffer.queryOptions({ offer_id: offerId }),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No applications yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Index</TableHead>
          <TableHead>Major</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.items.map((app) => {
          const student = app.student_profiles;

          return (
            <TableRow key={app.id}>
              <TableCell className="font-medium">
                {student.profiles.first_name} {student.profiles.last_name}
              </TableCell>
              <TableCell>{student.index_number ?? "—"}</TableCell>
              <TableCell>{student.major ?? "—"}</TableCell>
              <TableCell>{student.year_of_study ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[app.status] ?? "secondary"}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {app.applied_at
                  ? new Date(app.applied_at).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell>
                {app.status === "pending" ? (
                  <AcceptRejectApplicationActions
                    applicationId={app.id}
                    initialReason={app.employer_rejection_reason}
                    offerId={offerId}
                  />
                ) : app.employer_rejection_reason ? (
                  <p className="text-xs text-muted-foreground">
                    Reason: {app.employer_rejection_reason}
                  </p>
                ) : null}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
