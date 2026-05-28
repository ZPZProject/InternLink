"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@v1/ui/dialog";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";
import { ApplicationForm } from "./application-form";

export function ApplyButton({
  offerId,
  isActive,
}: {
  offerId: string;
  isActive: boolean;
}) {
  const t = useI18n();
  const trpc = useTRPC();

  const { data: onboarding, isLoading } = useQuery(
    trpc.student.getMyProfile.queryOptions(),
  );

  const hasOnboarding = onboarding?.school_id && onboarding?.index_number;

  if (!isActive) {
    return (
      <Button disabled className="w-full sm:w-auto">
        {t("applyButton.apply")}
      </Button>
    );
  }

  if (isLoading) {
    return <Button disabled>{t("applyButton.loading")}</Button>;
  }

  if (!hasOnboarding) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <a href="/student/onboarding">{t("applyButton.completeProfile")}</a>
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">{t("applyButton.apply")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("applyButton.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("applyButton.dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <ApplicationForm offerId={offerId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
