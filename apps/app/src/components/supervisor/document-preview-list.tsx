"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
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
import { useI18n } from "@/locales/client";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { useTRPC } from "@/trpc/react";
import { ReviewActionBar } from "./review-action-bar";

const reviewVariant: Record<
  string,
  "amber" | "blue" | "destructive" | "secondary"
> = {
  pending: "amber",
  approved: "blue",
  rejected: "destructive",
};

type Document = {
  id: string;
  type: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  review_status: string;
  uploaded_at: string;
  rejection_reason: string | null;
};

export function DocumentPreviewList({
  document,
  applicationId,
}: {
  document: Document;
  applicationId: string;
}) {
  const t = useI18n();
  const trpc = useTRPC();

  const typeLabel: Record<string, string> = {
    contract: t("documentPreview.type.contract"),
    internship_log: t("documentPreview.type.internshipLog"),
    other: t("documentPreview.type.other"),
  };

  const signedUrl = useQuery(
    trpc.documents.getSignedReadUrl.queryOptions(
      { document_id: document.id },
      { enabled: false },
    ),
  );

  const handleDownload = async () => {
    const result = await signedUrl.refetch();
    if (result.data?.signedUrl) {
      window.open(result.data.signedUrl, "_blank");
    } else {
      toast.error(t("documentPreview.toast.downloadError"));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileTypeIcon mimeType={document.mime_type} />
          <CardTitle className="text-base">
            {typeLabel[document.type] ?? document.type}
          </CardTitle>
          <Badge variant={reviewVariant[document.review_status] ?? "secondary"}>
            {document.review_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("documentPreview.col.file")}</TableHead>
              <TableHead>{t("documentPreview.col.size")}</TableHead>
              <TableHead>{t("documentPreview.col.uploaded")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="max-w-[300px] truncate font-medium">
                {document.file_name}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {(document.file_size_bytes / 1024).toFixed(1)} KB
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatISO(document.uploaded_at, { representation: "date" })}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownload}
                  >
                    {t("documentPreview.downloadBtn")}
                  </Button>
                  {document.review_status === "pending" ? (
                    <ReviewActionBar
                      documentId={document.id}
                      applicationId={applicationId}
                    />
                  ) : document.rejection_reason ? (
                    <span className="text-muted-foreground inline-flex items-center text-xs">
                      {t("documentPreview.rejectionReason", {
                        reason: document.rejection_reason,
                      })}
                    </span>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
