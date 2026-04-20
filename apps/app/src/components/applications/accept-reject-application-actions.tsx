"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import { Textarea } from "@v1/ui/textarea";
import { useState } from "react";
import { useTRPC } from "@/trpc/react";

export function AcceptRejectApplicationActions({
  applicationId,
  initialReason,
  offerId,
}: {
  applicationId: string;
  initialReason?: string | null;
  offerId: string;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState(initialReason ?? "");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mut = useMutation(
    trpc.applications.review.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success(
          variables.action === "accept"
            ? "Application accepted"
            : "Application rejected",
        );
        setRejectOpen(false);
        queryClient.invalidateQueries(
          trpc.applications.byOffer.queryOptions({ offer_id: offerId }),
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not review application",
        );
      },
    }),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            setRejectOpen(false);
            mut.mutate({
              application_id: applicationId,
              action: "accept",
              reason: null,
            });
          }}
          disabled={mut.isPending}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setRejectOpen((open) => !open)}
          disabled={mut.isPending}
        >
          Reject
        </Button>
      </div>
      {rejectOpen && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (optional)"
            rows={3}
          />
          <Button
            onClick={() =>
              mut.mutate({
                application_id: applicationId,
                action: "reject",
                reason: reason.trim() || null,
              })
            }
            disabled={mut.isPending}
          >
            Confirm rejection
          </Button>
        </div>
      )}
    </div>
  );
}
