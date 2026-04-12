import { Button } from "@v1/ui/button";
import Link from "next/link";

export function StudentProfileComplete() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Student profile</h1>
      <p className="text-muted-foreground text-sm">
        Your study details are on file. You can use the rest of the app.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/home">Home</Link>
      </Button>
    </div>
  );
}
