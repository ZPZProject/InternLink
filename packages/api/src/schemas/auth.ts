import { z } from "zod/v4";

/** Post sign-up redirect path only (same-origin). Prevents open redirects. */
const callbackNextSchema = z
  .string()
  .min(1)
  .refine(
    (p) =>
      p.startsWith("/") &&
      !p.startsWith("//") &&
      !p.includes("://") &&
      !p.includes("@"),
    "Invalid callback path",
  );

export const authSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["student", "employer", "supervisor"]),
  first_name: z.string().trim().max(120).optional(),
  last_name: z.string().trim().max(120).optional(),
  callbackNext: callbackNextSchema,
});

export const authSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
