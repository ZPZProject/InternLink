import { cn } from "@v1/ui/cn";

export function RichTextHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const trimmed = html.trim();
  if (!trimmed) {
    return null;
  }
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-muted-foreground",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}
