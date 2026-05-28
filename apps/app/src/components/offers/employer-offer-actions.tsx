"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/react";
import { EMPLOYER_OFFERS_LIST_QUERY } from "./employer-offers-query";

export function EmployerOfferActiveToggle({
  offerId,
  isActive,
}: {
  offerId: string;
  isActive: boolean;
}) {
  const t = useI18n();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mut = useMutation(
    trpc.offers.setActive.mutationOptions({
      onSuccess: () => {
        toast.success(
          isActive
            ? t("offerActions.toast.deactivated")
            : t("offerActions.toast.activated"),
        );
        queryClient.invalidateQueries(
          trpc.offers.listMine.queryOptions(EMPLOYER_OFFERS_LIST_QUERY),
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("offerActions.toast.error"),
        );
      },
    }),
  );

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={mut.isPending}
      onClick={() => mut.mutate({ id: offerId, is_active: !isActive })}
    >
      {mut.isPending
        ? t("offerActions.updatingBtn")
        : isActive
          ? t("offerActions.deactivateBtn")
          : t("offerActions.activateBtn")}
    </Button>
  );
}
