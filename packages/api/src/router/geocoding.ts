import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const openMeteoRow = z.object({
  id: z.number(),
  name: z.string(),
  admin1: z.string().optional(),
});

const openMeteoResponse = z.object({
  results: z.array(openMeteoRow).optional(),
});

function formatPlaceLabel(row: z.infer<typeof openMeteoRow>): string {
  if (row.admin1) {
    return `${row.name}, ${row.admin1}`;
  }
  return row.name;
}

export const geocodingRouter = createTRPCRouter({
  searchPoland: protectedProcedure
    .input(
      z.object({
        query: z.string().min(2).max(120),
        limit: z.number().int().min(1).max(20).optional().default(12),
      }),
    )
    .query(async ({ input }) => {
      const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
      url.searchParams.set("name", input.query.trim());
      url.searchParams.set("countryCode", "PL");
      url.searchParams.set("count", String(input.limit));
      url.searchParams.set("language", "pl");

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Could not reach geocoding service",
        });
      }

      const json: unknown = await res.json();
      const parsed = openMeteoResponse.safeParse(json);
      if (!parsed.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected geocoding response",
        });
      }

      const rows = parsed.data.results ?? [];

      return rows.map((row) => {
        const label = formatPlaceLabel(row);
        return {
          id: String(row.id),
          label: label.length > 200 ? `${label.slice(0, 197)}…` : label,
        };
      });
    }),
});
