import * as env from "env-var";
import {LOGIN_PROVIDER, OPENLOGIN_NETWORK} from "@toruslabs/openlogin-utils";

//// CHANGE THE DEFAULTS TO MATCH THE CONFIGURATION OF YOUR PROJECT
////
const DEFAULT_WEB3AUTH_NETWORK = "sapphire_devnet";
const DEFAULT_WEB3AUTH_CLIENT_ID = "BBUtlzggdx-jVCLSRnyOD8sVc2-lwB4L7IdmQkOMaq5642jfuXQjh_5fMIyhydo0eQIxxyLiMRLQK4WzSUAmMcA";
////

export const web3AuthLoginMethods = [
  {
    provider: LOGIN_PROVIDER.GOOGLE,
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
  },
  {
    provider: LOGIN_PROVIDER.TWITTER,
    name: "Twitter",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png",
  },
  {
    provider: LOGIN_PROVIDER.GITHUB,
    name: "GitHub",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Github_logo_svg.svg",
  },
  {
    provider: LOGIN_PROVIDER.APPLE,
    name: "Apple",
    logo: "/appleBlack.svg",
  },
  {
    provider: LOGIN_PROVIDER.DISCORD,
    name: "Discord",
    logo: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/653714c174fc6c8bbea73caf_636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg",
  },
]

export const web3AuthClientConfig = {
  clientId: env.get("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID").default(DEFAULT_WEB3AUTH_CLIENT_ID).asString(),
  web3AuthNetwork: env.get("NEXT_PUBLIC_WEB3AUTH_NETWORK").default(DEFAULT_WEB3AUTH_NETWORK).asEnum(Object.values(OPENLOGIN_NETWORK)),
};
