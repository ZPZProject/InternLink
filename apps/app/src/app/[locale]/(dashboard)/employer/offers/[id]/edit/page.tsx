import { Button } from "@v1/ui/button";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OfferForm } from "@/components/offers/offer-form";
import { caller } from "@/trpc/server";

type Props = { params: Promise<{ id: string }> };

export default async function EditOfferPage({ params }: Props) {
  const { id } = await params;

  const membership = await caller.company.myMembership();
  if (membership?.company.approval_status !== "approved") {
    redirect("/employer/offers");
  }

  const offer = await caller.offers.byId({ id });

  if (offer.company_id !== membership.member.company_id) {
    notFound();
  }

  const deadline =
    offer.application_deadline && offer.application_deadline.length > 0
      ? offer.application_deadline
      : "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="link" asChild>
        <Link href="/employer/offers">← Back to my offers</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit offer</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update the listing or toggle visibility with the active checkbox.
        </p>
      </div>
      <OfferForm
        mode="edit"
        offerId={offer.id}
        initial={{
          title: offer.title,
          description: offer.description ?? "",
          requirements: offer.requirements ?? "",
          location: offer.location,
          number_of_positions: offer.number_of_positions,
          start_date: offer.start_date,
          end_date: offer.end_date,
          application_deadline: deadline,
          is_active: offer.is_active,
        }}
      />
    </div>
  );
}
