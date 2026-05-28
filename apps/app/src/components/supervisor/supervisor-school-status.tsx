"use client";

import { Button } from "@v1/ui/button";
import Link from "next/link";
import { useI18n } from "@/locales/client";

type School = {
  id: string;
  name: string;
  approval_status: "pending" | "approved" | "rejected";
};

export function SupervisorSchoolStatus({ school }: { school: School }) {
  const t = useI18n();
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("schoolStatus.title")}
      </h1>
      <p className="text-muted-foreground text-sm">
        {t("schoolStatus.linkedTo", {
          name: (
            <span key="name" className="text-foreground font-medium">
              {school.name}
            </span>
          ),
        })}
      </p>
      <p className="text-sm">
        {t("schoolStatus.statusLabel")}{" "}
        <span className="font-medium capitalize">{school.approval_status}</span>
      </p>
      {school.approval_status === "pending" ? (
        <p className="text-muted-foreground text-sm">
          {t("schoolStatus.pendingMessage")}
        </p>
      ) : null}
      {school.approval_status === "rejected" ? (
        <p className="text-muted-foreground text-sm">
          {t("schoolStatus.rejectedMessage")}
        </p>
      ) : null}
      <Button asChild variant="outline" size="sm">
        <Link href="/home">{t("schoolStatus.homeBtn")}</Link>
      </Button>
    </div>
  );
}
