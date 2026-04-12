"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SchoolCombobox } from "@/components/school/school-combobox";
import { useTRPC } from "@/trpc/react";

export function SchoolSelector() {
  const router = useRouter();
  const trpc = useTRPC();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { data: school } = useQuery(
    trpc.school.get.queryOptions(
      {
        id: selectedId!,
      },
      {
        enabled: !!selectedId,
      },
    ),
  );

  const joinMutation = useMutation(
    trpc.school.join.mutationOptions({
      onSuccess: () => {
        toast.success("Joined school");
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not join school",
        );
      },
    }),
  );

  const busyJoin = joinMutation.isPending;

  function onJoin() {
    if (!selectedId) {
      toast.error("Select a school");
      return;
    }
    joinMutation.mutate({ school_id: selectedId });
  }

  return (
    <div className="space-y-4">
      <SchoolCombobox value={selectedId} onChange={setSelectedId} />

      {school && (
        <p className="text-muted-foreground text-xs">
          You will join <span className="text-foreground">{school.name}</span>.
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={busyJoin || !selectedId}
        onClick={onJoin}
      >
        {busyJoin ? "Joining…" : "Join school"}
      </Button>
    </div>
  );
}
