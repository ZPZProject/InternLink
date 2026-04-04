import { datadragonRouter } from './router/datadragon';
import { duosRouter } from './router/duos';
import { forumRouter } from './router/forum';
import { matchesRouter } from './router/matches';
import { playersRouter } from './router/players';
import { riftRankRouter } from './router/rift-rank';
import { riotRouter } from './router/riot';
import { userProfilesRouter } from './router/user-profiles';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({});

// export type definition of API
export type AppRouter = typeof appRouter;
