"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Icons } from "@v1/ui/icons";
import { toast } from "@v1/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import { formatISO } from "date-fns";
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";
import { FileTypeIcon } from "./file-type-icon";

const reviewVariant: Record<
  string,
  "amber" | "blue" | "destructive" | "secondary"
> = {
  pending: "amber",
  approved: "blue",
  rejected: "destructive",
};

export function DocumentList({ applicationId }: { applicationId: string }) {
  const t = useI18n();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [previewing, setPreviewing] = useState<string | null>(null);

  const typeLabel: Record<string, string> = {
    cv: t("documentList.type.cv"),
    contract: t("documentList.type.contract"),
    internship_log: t("documentList.type.internshipLog"),
    other: t("documentList.type.other"),
  };

  const { data: items, isLoading } = useQuery(
    trpc.documents.listByApplication.queryOptions({
      application_id: applicationId,
    }),
  );

  const del = useMutation(
    trpc.documents.delete.mutationOptions({
      onSuccess: async () => {
        toast.success(t("documentList.toast.deleted"));
        await queryClient.invalidateQueries(
          trpc.documents.listByApplication.queryOptions({
            application_id: applicationId,
          }),
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("documentList.toast.deleteError"),
        );
      },
    }),
  );

  async function handlePreview(documentId: string) {
    setPreviewing(documentId);
    try {
      const { signedUrl } = await queryClient.fetchQuery(
        trpc.documents.preview.queryOptions({ document_id: documentId }),
      );
      window.open(signedUrl, "_blank");
    } catch {
      toast.error(t("documentList.toast.previewError"));
    } finally {
      setPreviewing(null);
    }
  }

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("documentList.loading")}
      </p>
    );
  }

  if (!items?.length) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {t("documentList.empty")}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>{t("documentList.col.type")}</TableHead>
          <TableHead>{t("documentList.col.file")}</TableHead>
          <TableHead>{t("documentList.col.size")}</TableHead>
          <TableHead>{t("documentList.col.status")}</TableHead>
          <TableHead>{t("documentList.col.uploaded")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <FileTypeIcon mimeType={doc.mime_type} />
            </TableCell>
            <TableCell className="font-medium">
              {typeLabel[doc.type] ?? doc.type}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{doc.file_name}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {(doc.file_size_bytes / 1024).toFixed(1)} KB
            </TableCell>
            <TableCell>
              <Badge variant={reviewVariant[doc.review_status] ?? "secondary"}>
                {doc.review_status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatISO(doc.uploaded_at, { representation: "date" })}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={previewing === doc.id}
                  onClick={() => handlePreview(doc.id)}
                  title={t("documentList.previewBtn")}
                >
                  <Icons.Eye className="size-4" />
                </Button>
                {doc.review_status === "pending" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive"
                    disabled={del.isPending}
                    onClick={() => del.mutate({ id: doc.id })}
                    title={t("documentList.deleteBtn")}
                  >
                    <Icons.X className="size-4" />
                  </Button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
