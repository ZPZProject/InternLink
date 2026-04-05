import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Create account
        </h1>
        <p className="text-muted-foreground text-sm">
          Register as a student, employer, or supervisor.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
