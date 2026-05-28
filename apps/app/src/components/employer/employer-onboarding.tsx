"use client";

import { Tabs, TabsList, TabsTrigger } from "@v1/ui/tabs";
import { useState } from "react";
import { useI18n } from "@/locales/client";
import { CompanyForm } from "./company-form";
import { CompanySelector } from "./company-selector";

type Mode = "join" | "create";

export function EmployerOnboarding() {
  const t = useI18n();
  const [mode, setMode] = useState<Mode>("join");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("employerOnboarding.title")}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("employerOnboarding.subtitle")}
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
            {t("employerOnboarding.tabJoin")}
          </TabsTrigger>
          <TabsTrigger value="create">
            {t("employerOnboarding.tabCreate")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "join" ? <CompanySelector /> : <CompanyForm />}
    </div>
  );
}
