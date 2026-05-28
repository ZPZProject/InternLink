"use client";

import { useChangeLocale, useCurrentLocale, useI18n } from "@/locales/client";
import { Button } from "@v1/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@v1/ui/dropdown-menu";
import { Languages } from "lucide-react";

const LOCALES = [
  { value: "en", labelKey: "localeSwitcher.en" },
  { value: "pl", labelKey: "localeSwitcher.pl" },
] as const;

export function LocaleSwitcher() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const changeLocale = useChangeLocale();

  const currentLabel =
    locale === "en" ? t("localeSwitcher.en") : t("localeSwitcher.pl");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Languages className="size-4" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ value, labelKey }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => changeLocale(value)}
            data-active={locale === value}
            className="gap-2"
          >
            <span
              className={
                locale === value ? "font-medium" : "text-muted-foreground"
              }
            >
              {t(labelKey)}
            </span>
            {locale === value && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
