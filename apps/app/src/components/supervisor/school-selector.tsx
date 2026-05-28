"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import { toast } from "@v1/ui/sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { SchoolCombobox } from "@/components/school/school-combobox";
import { useTRPC } from "@/trpc/react";

export function SchoolSelector() {
  const t = useI18n();
  const router = useRouter();
  const trpc = useTRPC();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { data: school } = useQuery(
    trpc.school.get.queryOptions(
      { id: selectedId! },
      { enabled: !!selectedId },
    ),
  );

  const joinMutation = useMutation(
    trpc.school.join.mutationOptions({
      onSuccess: () => {
        toast.success(t("schoolSelector.toast.success"));
        router.refresh();
        router.push("/home");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : t("schoolSelector.toast.error"),
        );
      },
    }),
  );

  const busyJoin = joinMutation.isPending;

  function onJoin() {
    if (!selectedId) {
      toast.error(t("schoolSelector.toast.noSelection"));
      return;
    }
    joinMutation.mutate({ school_id: selectedId });
  }

  return (
    <div className="space-y-4">
      <SchoolCombobox value={selectedId} onChange={setSelectedId} />

      {school && (
        <p className="text-muted-foreground text-xs">
          {t("schoolSelector.willJoin", {
            name: (
              <span key="name" className="text-foreground">
                {school.name}
              </span>
            ),
          })}
        </p>
      )}

      <Button
        type="button"
        className="w-full"
        disabled={busyJoin || !selectedId}
        onClick={onJoin}
      >
        {busyJoin
          ? t("schoolSelector.joiningBtn")
          : t("schoolSelector.joinBtn")}
      </Button>
    </div>
  );
}
