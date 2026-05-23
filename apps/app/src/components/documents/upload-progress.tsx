"use client";

import { cn } from "@v1/ui/cn";
import { Progress } from "@v1/ui/progress";

export function UploadProgress({
  value,
  className,
}: {
  /** 0–100, or null for indeterminate */
  value: number | null;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Progress value={value === null ? undefined : value} />
      <p className="text-muted-foreground text-xs">
        {value === null ? "Uploading…" : `${value}%`}
      </p>
    </div>
  );
}
