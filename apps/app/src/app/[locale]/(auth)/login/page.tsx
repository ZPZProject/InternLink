import { getI18n } from "@/locales/server";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const t = await getI18n();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("login.title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("login.subtitle")}</p>
      </div>
      <LoginForm />
    </div>
  );
}
