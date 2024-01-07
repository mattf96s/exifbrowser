import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

if (ENV.MODE === "production" && ENV.SENTRY_DSN) {
  import("./utils/monitoring.client.tsx").then(({ init }) => init());
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
