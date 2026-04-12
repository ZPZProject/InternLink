import { Button } from "@v1/ui/button";
import Link from "next/link";

export function EmployerOffersHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My offers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage internship listings for your company.
        </p>
      </div>

      <Button type="button" asChild>
        <Link href="/employer/offers/new">New offer</Link>
      </Button>
    </div>
  );
}
