"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import { useTRPC } from "@/trpc/react";
import { EMPLOYER_OFFERS_LIST_QUERY } from "./employer-offers-query";

export function EmployerOfferActiveToggle({
  offerId,
  isActive,
}: {
  offerId: string;
  isActive: boolean;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const mut = useMutation(
    trpc.offers.setActive.mutationOptions({
      onSuccess: () => {
        toast.success(isActive ? "Offer deactivated" : "Offer activated");
        queryClient.invalidateQueries(
          trpc.offers.listMine.queryOptions(EMPLOYER_OFFERS_LIST_QUERY),
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not update status",
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
      {mut.isPending ? "Updating…" : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
