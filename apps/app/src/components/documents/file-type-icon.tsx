import { cn } from "@v1/ui/cn";
import { FileText, FileType } from "lucide-react";

export function FileTypeIcon({
  mimeType,
  className,
}: {
  mimeType: string;
  className?: string;
}) {
  if (mimeType === "application/pdf") {
    return (
      <FileText
        className={cn("size-5 text-red-600 dark:text-red-400", className)}
        aria-hidden
      />
    );
  }
  return (
    <FileType
      className={cn("size-5 text-blue-600 dark:text-blue-400", className)}
      aria-hidden
    />
  );
}
