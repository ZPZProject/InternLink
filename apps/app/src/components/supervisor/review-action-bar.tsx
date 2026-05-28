"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import { Textarea } from "@v1/ui/textarea";
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function ReviewActionBar({
  documentId,
  applicationId,
}: {
  documentId: string;
  applicationId: string;
}) {
  const t = useI18n();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const mut = useMutation(
    trpc.documents.review.mutationOptions({
      onSuccess: (_, variables) => {
        toast.success(
          variables.action === "approve"
            ? t("reviewActionBar.toast.approved")
            : t("reviewActionBar.toast.rejected"),
        );
        setRejectOpen(false);
        setReason("");
        queryClient.invalidateQueries(
          trpc.documents.listByApplicationSupervisor.queryOptions({
            application_id: applicationId,
          }),
        );
        queryClient.invalidateQueries(
          trpc.documents.reviewQueue.queryOptions(),
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("reviewActionBar.toast.error"),
        );
      },
    }),
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            setRejectOpen(false);
            mut.mutate({ document_id: documentId, action: "approve" });
          }}
          disabled={mut.isPending}
        >
          {t("reviewActionBar.approveBtn")}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setRejectOpen((open) => !open)}
          disabled={mut.isPending}
        >
          {t("reviewActionBar.rejectBtn")}
        </Button>
      </div>
      {rejectOpen && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("reviewActionBar.reasonPlaceholder")}
            rows={3}
          />
          <Button
            size="sm"
            onClick={() =>
              mut.mutate({
                document_id: documentId,
                action: "reject",
                rejection_reason: reason.trim() || undefined,
              })
            }
            disabled={mut.isPending}
          >
            {t("reviewActionBar.confirmRejectionBtn")}
          </Button>
        </div>
      )}
    </div>
  );
}
