import { ReviewDetailContent } from "@/components/supervisor/review-detail-content";

type Props = { params: Promise<{ id: string }> };

export default async function SupervisorReviewDetailPage({ params }: Props) {
  const { id } = await params;

  return <ReviewDetailContent applicationId={id} />;
}
