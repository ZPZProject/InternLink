"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import Link from "next/link";
import { useTRPC } from "@/trpc/react";

const statusVariant: Record<
  string,
  "blue" | "destructive" | "amber" | "secondary"
> = {
  pending: "amber",
  accepted: "blue",
  rejected: "destructive",
  withdrawn: "secondary",
};

export function ApplicationList() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.applications.myList.queryOptions({ limit: 20, offset: 0 }),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data?.items.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>You haven&apos;t applied to any offers yet.</p>
        <Button asChild variant="link">
          <Link href="/offers">Browse offers</Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Position</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.items.map((app) => {
          const offer = app.internship_offers;

          return (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{offer.title}</TableCell>
              <TableCell>{offer.companies.name}</TableCell>
              <TableCell>{offer.location}</TableCell>
              <TableCell>
                <Badge variant={statusVariant[app.status] ?? "secondary"}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {app.applied_at
                  ? new Date(app.applied_at).toLocaleDateString()
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-1">
                  <Button asChild variant="link" size="sm">
                    <Link href={`/student/applications/${app.id}`}>
                      Details
                    </Link>
                  </Button>
                  <Button asChild variant="link" size="sm">
                    <Link href={`/offers/${offer.id}`}>Offer</Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
