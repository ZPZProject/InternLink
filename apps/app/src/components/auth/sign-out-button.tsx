"use client";

import { createClient } from "@v1/supabase/client";
import { Button } from "@v1/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
      }}
    >
      Sign out
    </Button>
  );
}
