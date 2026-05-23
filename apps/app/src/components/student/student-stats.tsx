"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import { Icons } from "@v1/ui/icons";

type Stats = {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
};

export function StudentStats() {
  const { data: homeStats } = useSuspenseQuery({
    queryKey: ["profile", "homeStats"],
    queryFn: async () => {
      const res = await fetch("/api/trpc/profile.homeStats", { method: "GET" });
      const json = await res.json();
      return json.result.data as { role: string; stats: Stats };
    },
  });

  if (!homeStats || homeStats.role !== "student") {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <Icons.Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {homeStats.stats.totalApplications}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Icons.Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">
            {homeStats.stats.pendingApplications}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          <Icons.Check className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {homeStats.stats.acceptedApplications}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
