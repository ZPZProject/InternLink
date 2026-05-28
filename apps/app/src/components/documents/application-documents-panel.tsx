"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@v1/ui/card";
import { useI18n } from "@/locales/client";
import { DocumentList } from "./document-list";
import { DocumentUploadZone } from "./document-upload-zone";

export function ApplicationDocumentsPanel({
  applicationId,
  canUpload,
}: {
  applicationId: string;
  canUpload: boolean;
}) {
  const t = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("documentsPanel.title")}</CardTitle>
        <CardDescription>
          {canUpload
            ? t("documentsPanel.descriptionCanUpload")
            : t("documentsPanel.descriptionNoUpload")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {canUpload && <DocumentUploadZone applicationId={applicationId} />}
        <DocumentList applicationId={applicationId} />
      </CardContent>
    </Card>
  );
}
