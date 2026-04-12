import { authRouter } from "./router/auth";
import { companyRouter } from "./router/company";
import { offersRouter } from "./router/offers";
import { profileRouter } from "./router/profile";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  company: companyRouter,
  offers: offersRouter,
  profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
