"use client";

import { Button } from "@v1/ui/button";
import Link from "next/link";
import { useI18n } from "@/locales/client";

type Company = {
  id: string;
  name: string;
  approval_status: "pending" | "approved" | "rejected";
};

export function EmployerCompanyStatus({ company }: { company: Company }) {
  const t = useI18n();
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("companyStatus.title")}
      </h1>
      <p className="text-muted-foreground text-sm">
        {t("companyStatus.linkedTo", {
          name: (
            <span key="name" className="text-foreground font-medium">
              {company.name}
            </span>
          ),
        })}
      </p>
      <p className="text-sm">
        {t("companyStatus.statusLabel")}{" "}
        <span className="font-medium capitalize">{company.approval_status}</span>
      </p>
      {company.approval_status === "pending" ? (
        <p className="text-muted-foreground text-sm">
          {t("companyStatus.pendingMessage")}
        </p>
      ) : null}
      {company.approval_status === "rejected" ? (
        <p className="text-muted-foreground text-sm">
          {t("companyStatus.rejectedMessage")}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/home">{t("companyStatus.homeBtn")}</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/employer/offers">{t("companyStatus.myOffersBtn")}</Link>
        </Button>
      </div>
    </div>
  );
}
