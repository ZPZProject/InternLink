"use client";

import { Tabs, TabsList, TabsTrigger } from "@v1/ui/tabs";
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { SchoolForm } from "./school-form";
import { SchoolSelector } from "./school-selector";

type Mode = "join" | "create";

export function SupervisorOnboarding() {
  const t = useI18n();
  const [mode, setMode] = useState<Mode>("join");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("supervisorOnboarding.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("supervisorOnboarding.subtitle")}
        </p>
      </div>

      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as Mode)}
        defaultValue="join"
        className="w-[400px]"
      >
        <TabsList>
          <TabsTrigger value="join">
            {t("supervisorOnboarding.tabJoin")}
          </TabsTrigger>
          <TabsTrigger value="create">
            {t("supervisorOnboarding.tabCreate")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "join" ? <SchoolSelector /> : <SchoolForm />}
    </div>
  );
}
