import { getI18n } from "@/locales/server";
import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@v1/ui/card";
import Link from "next/link";
import { ApplyButton } from "@/components/applications/apply-button";
import { RichTextHtml } from "@/components/editor/rich-text-html";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function OfferDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getI18n();

  const offer = await caller.offers.byId({ id });
  const profile = await caller.profile.me();

  const isStudent = profile?.role === "student";

  return (
    <div className="space-y-6">
      <Button asChild variant="link" size="sm">
        <Link href="/offers">{t("offerDetail.backLink")}</Link>
      </Button>

      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-2xl">{offer.title}</CardTitle>
            <Badge variant="secondary">{offer.companies.name}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {offer.location} · {offer.start_date} → {offer.end_date}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <section>
            <h2 className="mb-1 font-medium">
              {t("offerDetail.descriptionHeading")}
            </h2>
            {offer.description?.trim() ? (
              <RichTextHtml html={offer.description} />
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </section>
          {offer.requirements?.trim() ? (
            <section>
              <h2 className="mb-1 font-medium">
                {t("offerDetail.requirementsHeading")}
              </h2>
              <RichTextHtml html={offer.requirements} />
            </section>
          ) : null}
          <p className="text-muted-foreground text-xs">
            {t("offerDetail.positions")} {offer.number_of_positions}
            {offer.application_deadline
              ? ` ${t("offerDetail.applyBy", { date: offer.application_deadline })}`
              : null}
          </p>
          {isStudent && <ApplyButton offerId={offer.id} />}
        </CardContent>
      </Card>
    </div>
  );
}
