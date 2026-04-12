"use client";

import { Tabs, TabsList, TabsTrigger } from "@v1/ui/tabs";
import { useState } from "react";
import { CompanyForm } from "./company-form";
import { CompanySelector } from "./company-selector";

type Mode = "join" | "create";

export function EmployerOnboarding() {
  const [mode, setMode] = useState<Mode>("join");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company setup</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Join an approved company or register a new one. New companies require
          administrator approval before you can post internship offers.
        </p>
      </div>

      <Tabs
        value={mode}
        onValueChange={(value) => setMode(value as Mode)}
        defaultValue="join"
        className="w-[400px]"
      >
        <TabsList>
          <TabsTrigger value="join">Join</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "join" ? <CompanySelector /> : <CompanyForm />}
    </div>
  );
}
