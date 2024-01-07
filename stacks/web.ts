import { RemixSite, StackContext, use } from "sst/constructs";
import { DNS } from "./dns";

export function Web({ stack, app }: StackContext) {
  const dns = use(DNS);

  const site = new RemixSite(stack, "Site", {
    path: "packages/web/",
    runtime: "nodejs20.x",
    customDomain: {
      domainName: dns.domain,
      hostedZone: dns.zone.zoneName,
    },
    environment: {
      NODE_ENV: app.mode === "dev" ? "development" : "production",
      STAGE: app.stage,
      REGION: app.region,
    },
  });

  stack.addOutputs({
    URL: site.url || "localhost",
  });
}
