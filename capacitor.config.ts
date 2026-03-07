import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.roabusiness.app",
  appName: "RoaBusiness",
  webDir: "dist",
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: "apksigner",
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
