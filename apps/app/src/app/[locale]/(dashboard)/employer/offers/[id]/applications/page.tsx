import { Button } from "@v1/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationsHeader } from "@/components/applications/applications-header";
import { EmployerApplicationList } from "@/components/applications/employer-application-list";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function EmployerOfferApplicationsPage({ params }: Props) {
  const { id } = await params;

  const membership = await caller.company.myMembership();
  const offer = await caller.offers.byId({ id });

  if (!offer || membership?.member.company_id !== offer.company_id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="link" size="sm">
        <Link href="/employer/offers">← Back to my offers</Link>
      </Button>

      <ApplicationsHeader
        isEmployer
        offerTitle={offer.title}
      />

      <EmployerApplicationList offerId={offer.id} />
    </div>
  );
}