import { Button } from "@v1/ui/button";

export function EmployerOffersHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My offers</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage internship listings for your company.
        </p>
      </div>

      <Button type="button" disabled>
        New offer
      </Button>
    </div>
  );
}
