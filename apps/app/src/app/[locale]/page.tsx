import { createClient } from "@v1/supabase/server";
import { redirect } from "next/navigation";

export default async function LocaleRootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }
  redirect("/login");
}
