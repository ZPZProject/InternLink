import { getI18n } from "@/locales/server";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const t = await getI18n();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("register.title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("register.subtitle")}
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
