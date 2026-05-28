"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Skeleton } from "@v1/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";

export function DocumentReviewTable() {
  const t = useI18n();
  const trpc = useTRPC();
  const { data: items, isLoading } = useQuery(
    trpc.documents.reviewQueue.queryOptions(),
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        {t("reviewTable.empty")}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("reviewTable.col.student")}</TableHead>
          <TableHead>{t("reviewTable.col.offer")}</TableHead>
          <TableHead>{t("reviewTable.col.company")}</TableHead>
          <TableHead>{t("reviewTable.col.documents")}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.application_id}>
            <TableCell className="font-medium">
              {item.student.profiles.first_name} {item.student.profiles.last_name}
              <span className="block text-xs text-muted-foreground">
                {item.student.profiles.email}
              </span>
            </TableCell>
            <TableCell>{item.offer.title}</TableCell>
            <TableCell>{item.offer.companies.name}</TableCell>
            <TableCell>
              <Badge variant={item.pending_documents > 0 ? "amber" : "blue"}>
                {t("reviewTable.pendingBadge", {
                  pending: item.pending_documents,
                  total: item.total_documents,
                })}
              </Badge>
            </TableCell>
            <TableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={`/supervisor/reviews/${item.application_id}`}>
                  {t("reviewTable.reviewBtn")}
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
