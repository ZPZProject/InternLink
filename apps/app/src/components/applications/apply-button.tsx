"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@v1/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@v1/ui/dialog";
import { useTRPC } from "@/trpc/react";
import { ApplicationForm } from "./application-form";

export function ApplyButton({ offerId }: { offerId: string }) {
  const trpc = useTRPC();
  const { data: profile, isLoading: profileLoading } = useQuery(
    trpc.profile.me.queryOptions(),
  );

  const { data: onboarding, isLoading: onboardingLoading } = useQuery(
    trpc.student.getMyProfile.queryOptions(),
  );

  const isLoading = profileLoading || onboardingLoading;
  const isStudent = profile?.role === "student";
  const hasOnboarding =
    onboarding?.school_id && onboarding?.index_number;

  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (!isStudent) {
    return null;
  }

  if (!hasOnboarding) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <a href="/student/onboarding">Complete profile to apply</a>
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">Apply now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for this position</DialogTitle>
          <DialogDescription>
            Write a brief motivation letter to stand out from other candidates.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          <ApplicationForm offerId={offerId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}