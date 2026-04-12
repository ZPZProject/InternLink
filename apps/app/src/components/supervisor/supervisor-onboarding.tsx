"use client";

import { Tabs, TabsList, TabsTrigger } from "@v1/ui/tabs";
import { useState } from "react";
import { SchoolForm } from "./school-form";
import { SchoolSelector } from "./school-selector";

type Mode = "join" | "create";

export function SupervisorOnboarding() {
  const [mode, setMode] = useState<Mode>("join");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">School setup</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Join an existing school or university or register a new one. Once
          linked, you can use supervisor features for that institution.
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

      {mode === "join" ? <SchoolSelector /> : <SchoolForm />}
    </div>
  );
}
