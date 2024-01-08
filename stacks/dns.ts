import { HostedZone } from "aws-cdk-lib/aws-route53";
import { StackContext } from "sst/constructs";

const PRODUCTION = "exifbrowser.com";
const DEV = "dev.exifbrowser.com";

export function DNS(ctx: StackContext) {
  if (ctx.stack.stage !== "production") return;

  if (ctx.stack.stage === "production") {
    const zone = new HostedZone(ctx.stack, "zone", {
      zoneName: PRODUCTION,
    });
    return {
      zone,
      domain: PRODUCTION,
    };
  }

  if (ctx.stack.stage === "dev") {
    return {
      zone: new HostedZone(ctx.stack, "zone", {
        zoneName: DEV,
      }),
      domain: DEV,
    };
  }

  const zone = HostedZone.fromLookup(ctx.stack, "zone", {
    domainName: DEV,
  });
  return {
    zone,
    domain: `${ctx.stack.stage}.${DEV}`,
  };
}
