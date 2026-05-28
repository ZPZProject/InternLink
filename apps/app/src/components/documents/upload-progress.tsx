"use client";

import { cn } from "@v1/ui/cn";
import { Progress } from "@v1/ui/progress";
import { useI18n } from "@/locales/client";

export function UploadProgress({
  value,
  className,
}: {
  /** 0–100, or null for indeterminate */
  value: number | null;
  className?: string;
}) {
  const t = useI18n();
  return (
    <div className={cn("space-y-1", className)}>
      <Progress value={value === null ? undefined : value} />
      <p className="text-muted-foreground text-xs">
        {value === null ? t("uploadProgress.uploading") : `${value}%`}
      </p>
    </div>
  );
}
