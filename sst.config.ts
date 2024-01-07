import { SSTConfig } from "sst";
import { Web } from "./stacks/web";
import { DNS } from "./stacks/dns";
import { Email } from "./stacks/email";

export default {
  config(input) {
    return {
      name: "exifbrowser",
      region: "eu-west-1",
      profile: input.stage === "production" ? "exifbrowser" : "exifbrowser", // #TODO: staging environment
    };
  },
  stacks(app) {
    if (app.stage !== "production") {
      app.setDefaultRemovalPolicy("destroy");
    }
    app.setDefaultFunctionProps({
      tracing: "disabled",
      runtime: "nodejs20.x",
    });

    app.stack(DNS).stack(Email).stack(Web);
  },
} satisfies SSTConfig;
