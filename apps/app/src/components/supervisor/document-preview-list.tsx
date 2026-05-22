"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import { toast } from "@v1/ui/sonner";
import { FileTypeIcon } from "@/components/documents/file-type-icon";
import { ReviewActionBar } from "./review-action-bar";
import { useTRPC } from "@/trpc/react";

const typeLabel: Record<string, string> = {
  contract: "Contract",
  internship_log: "Internship log",
  other: "Other",
};

const reviewVariant: Record<string, "amber" | "blue" | "destructive" | "secondary"> = {
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
  const trpc = useTRPC();

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
      toast.error("Could not generate download link");
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
              <TableHead>File</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
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
                {new Date(document.uploaded_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    Download
                  </Button>
                  {document.review_status === "pending" ? (
                    <ReviewActionBar
                      documentId={document.id}
                      applicationId={applicationId}
                    />
                  ) : document.rejection_reason ? (
                    <span className="text-muted-foreground inline-flex items-center text-xs">
                      Reason: {document.rejection_reason}
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
