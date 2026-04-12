import { SignOutButton } from "./sign-out-button";

export function InactiveAccountScreen() {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <p className="text-muted-foreground max-w-md text-center">
        Your account is inactive. Contact an administrator if this is a mistake.
      </p>
      <SignOutButton />
    </div>
  );
}
