import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.omnifinance.app",
  appName: "OmniFinance",
  webDir: "out",
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
