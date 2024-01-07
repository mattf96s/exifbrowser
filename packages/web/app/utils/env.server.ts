// https://github.com/jacobparis/epic-issue-tracker/blob/main/app/utils/env.server.ts

import { z } from "zod";

const NODE_ENV = "development";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),

  
});

export const getServersideEnv = () => {
  const envs = {
    
    NODE_ENV,
    
  };
  const parsed = schema.safeParse(envs);

  if (parsed.success === false) {
    // eslint-disable-next-line no-console
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables");
  }

  return parsed.data;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const envs = {
   
    NODE_ENV,
  
  };
  const parsed = schema.safeParse(envs);

  if (parsed.success === false) {
    // eslint-disable-next-line no-console
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
