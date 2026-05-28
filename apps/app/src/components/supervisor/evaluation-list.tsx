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
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";
import { EvaluationForm } from "./evaluation-form";

export function EvaluationList() {
  const t = useI18n();
  const trpc = useTRPC();
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const { data: items } = useQuery(
    trpc.evaluations.listCompletable.queryOptions(),
  );

  if (!items || items.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        {t("evaluationList.empty")}
      </p>
    );
  }

  const selectedItem = items.find(
    (item) => item.application_id === selectedApplicationId,
  );

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("evaluationList.col.student")}</TableHead>
            <TableHead>{t("evaluationList.col.offer")}</TableHead>
            <TableHead>{t("evaluationList.col.company")}</TableHead>
            <TableHead>{t("evaluationList.col.documents")}</TableHead>
            <TableHead className="text-right">
              {t("evaluationList.col.action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const studentName =
              `${item.student.profiles.first_name ?? ""} ${item.student.profiles.last_name ?? ""}`.trim();

            return (
              <TableRow key={item.application_id}>
                <TableCell className="font-medium">
                  {studentName ||
                    item.student.profiles.email ||
                    t("evaluationList.fallbackStudent")}
                  <span className="block text-xs text-muted-foreground">
                    {item.student.profiles.email}
                  </span>
                </TableCell>
                <TableCell>{item.offer.title}</TableCell>
                <TableCell>{item.offer.companies.name}</TableCell>
                <TableCell>
                  <Badge variant="blue">
                    {t("evaluationList.approvedBadge", {
                      approved: item.approved_documents,
                      total: item.total_documents,
                    })}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={
                      selectedApplicationId === item.application_id
                        ? "secondary"
                        : "outline"
                    }
                    onClick={() =>
                      setSelectedApplicationId(item.application_id)
                    }
                  >
                    {t("evaluationList.evaluateBtn")}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedItem && (
        <EvaluationForm
          applicationId={selectedItem.application_id}
          studentName={
            `${selectedItem.student.profiles.first_name ?? ""} ${selectedItem.student.profiles.last_name ?? ""}`.trim() ||
            selectedItem.student.profiles.email ||
            t("evaluationList.fallbackStudent")
          }
          onDone={() => setSelectedApplicationId(null)}
        />
      )}
    </div>
  );
}
