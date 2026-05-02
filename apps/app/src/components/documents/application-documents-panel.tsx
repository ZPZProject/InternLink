"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@v1/ui/card";
import { DocumentList } from "./document-list";
import { DocumentUploadZone } from "./document-upload-zone";

export function ApplicationDocumentsPanel({
  applicationId,
  canUpload,
}: {
  applicationId: string;
  canUpload: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          {canUpload
            ? "Upload internship documents for your supervisor to review."
            : "Document uploads are available after the employer accepts your application."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {canUpload && <DocumentUploadZone applicationId={applicationId} />}
        <DocumentList applicationId={applicationId} />
      </CardContent>
    </Card>
  );
}
