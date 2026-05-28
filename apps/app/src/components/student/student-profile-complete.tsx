import { getI18n } from "@/locales/server";
import { Button } from "@v1/ui/button";
import Link from "next/link";

export async function StudentProfileComplete() {
  const t = await getI18n();
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("studentProfileComplete.title")}
      </h1>
      <p className="text-muted-foreground text-sm">
        {t("studentProfileComplete.description")}
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/home">{t("studentProfileComplete.homeBtn")}</Link>
      </Button>
    </div>
  );
}
