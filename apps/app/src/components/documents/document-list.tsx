"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import { useTRPC } from "@/trpc/react";
import { FileTypeIcon } from "./file-type-icon";

const typeLabel: Record<string, string> = {
  contract: "Contract",
  internship_log: "Internship log",
  other: "Other",
};

const reviewVariant: Record<
  string,
  "amber" | "blue" | "destructive" | "secondary"
> = {
  pending: "amber",
  approved: "blue",
  rejected: "destructive",
};

export function DocumentList({ applicationId }: { applicationId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery(
    trpc.documents.listByApplication.queryOptions({
      application_id: applicationId,
    }),
  );

  const del = useMutation(
    trpc.documents.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Document removed");
        await queryClient.invalidateQueries(
          trpc.documents.listByApplication.queryOptions({
            application_id: applicationId,
          }),
        );
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not delete");
      },
    }),
  );

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading documents…</p>;
  }

  if (!items?.length) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10" />
          <TableHead>Type</TableHead>
          <TableHead>File</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded</TableHead>
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
            <TableCell className="max-w-[200px] truncate">
              {doc.file_name}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {(doc.file_size_bytes / 1024).toFixed(1)} KB
            </TableCell>
            <TableCell>
              <Badge variant={reviewVariant[doc.review_status] ?? "secondary"}>
                {doc.review_status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(doc.uploaded_at).toLocaleString()}
            </TableCell>
            <TableCell>
              {doc.review_status === "pending" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  disabled={del.isPending}
                  onClick={() => del.mutate({ id: doc.id })}
                >
                  Delete
                </Button>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
