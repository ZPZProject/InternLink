import { applicationsRouter } from "./router/applications";
import { authRouter } from "./router/auth";
import { companyRouter } from "./router/company";
import { geocodingRouter } from "./router/geocoding";
import { offersRouter } from "./router/offers";
import { profileRouter } from "./router/profile";
import { schoolRouter } from "./router/school";
import { studentRouter } from "./router/student";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  applications: applicationsRouter,
  auth: authRouter,
  company: companyRouter,
  geocoding: geocodingRouter,
  offers: offersRouter,
  profile: profileRouter,
  school: schoolRouter,
  student: studentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
