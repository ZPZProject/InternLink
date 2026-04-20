"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import { Textarea } from "@v1/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@v1/ui/dialog";
import { toast } from "@v1/ui/sonner";
import { useState } from "react";
import { useTRPC } from "@/trpc/react";

const statusVariant: Record<string, "blue" | "destructive" | "amber" | "secondary"> = {
  pending: "amber",
  accepted: "blue",
  rejected: "destructive",
  withdrawn: "secondary",
};

function AcceptRejectActions({
  applicationId,
  offerId,
  initialReason,
}: {
  applicationId: string;
  offerId: string;
  initialReason?: string | null;
}) {
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [reason, setReason] = useState(initialReason ?? "");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mut = useMutation(
    trpc.applications.review.mutationOptions({
      onSuccess: () => {
        toast.success("Application reviewed");
        queryClient.invalidateQueries();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not review application",
        );
      },
    }),
  );

  function handleSubmit() {
    if (!action) return;
    mut.mutate({
      application_id: applicationId,
      action,
      reason: action === "reject" ? reason : null,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => setAction("accept")}
          disabled={mut.isPending}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setAction("reject")}
          disabled={mut.isPending}
        >
          Reject
        </Button>
      </div>
      {action === "reject" && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={mut.isPending}>
            Confirm rejection
          </Button>
        </div>
      )}
    </div>
  );
}

export function EmployerApplicationList({ offerId }: { offerId: string }) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.applications.byOffer.queryOptions({ offer_id: offerId }),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data?.items.length) {
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
          const student = app.student_profiles as {
            id: string;
            index_number: string | null;
            major: string | null;
            year_of_study: number | null;
            profiles: {
              first_name: string | null;
              last_name: string | null;
              email: string | null;
            };
          };
          return (
            <TableRow key={app.id}>
              <TableCell className="font-medium">
                {student.profiles?.first_name} {student.profiles?.last_name}
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
                  <AcceptRejectActions
                    applicationId={app.id}
                    offerId={offerId}
                    initialReason={app.employer_rejection_reason}
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