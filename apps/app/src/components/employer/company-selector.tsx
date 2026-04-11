"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTRPC } from "@/trpc/react";
import { CompanyCombobox } from "./company-combobox";

export function CompanySelector() {
  const router = useRouter();
  const trpc = useTRPC();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { data: company } = useQuery(
    trpc.company.get.queryOptions(
      {
        id: selectedId!,
      },
      {
        enabled: !!selectedId,
      },
    ),
  );

  const joinMutation = useMutation(
    trpc.company.join.mutationOptions({
      onSuccess: () => {
        toast.success("Joined company");
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not join company",
        );
      },
    }),
  );

  const busyJoin = joinMutation.isPending;

  function onJoin() {
    if (!selectedId) {
      toast.error("Select a company");
      return;
    }
    joinMutation.mutate({ company_id: selectedId });
  }

  return (
    <div className="space-y-4">
      <CompanyCombobox value={selectedId} onChange={setSelectedId} />

      {company && (
        <p className="text-muted-foreground text-xs">
          You will join <span className="text-foreground">{company.name}</span>.
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={busyJoin || !selectedId}
        onClick={onJoin}
      >
        {busyJoin ? "Joining…" : "Join company"}
      </Button>
    </div>
  );
}
