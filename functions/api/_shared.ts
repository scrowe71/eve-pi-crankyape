// Shared helpers for the EVE PI Pages Functions.
import CryptoJS from "crypto-js";

export interface Env {
  EVE_SSO_CLIENT_ID: string;
  EVE_SSO_SECRET: string;
  EVE_SSO_CALLBACK_URL: string;
  PRAISAL_URL?: string;
}

export const EVE_SSO_TOKEN_URL = "https://login.eveonline.com/v2/oauth/token";
export const EVE_SSO_REVOKE_URL = "https://login.eveonline.com/v2/oauth/revoke";
export const USER_AGENT =
  "EVE PI (pi.crankyape.space; fork of https://github.com/calli-eve/eve-pi)";

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const ssoHeaders = (env: Env) => ({
  "Content-Type": "application/x-www-form-urlencoded",
  Authorization: `Basic ${btoa(`${env.EVE_SSO_CLIENT_ID}:${env.EVE_SSO_SECRET}`)}`,
  "User-Agent": USER_AGENT,
});

// Refresh tokens are stored in the browser encrypted with the SSO secret.
export const encrypt = (value: string, env: Env) =>
  CryptoJS.AES.encrypt(value, env.EVE_SSO_SECRET).toString();

export const decrypt = (value: string, env: Env) =>
  CryptoJS.AES.decrypt(value, env.EVE_SSO_SECRET).toString(CryptoJS.enc.Utf8);

export const extractCharacter = (accessToken: string | undefined) => {
  if (!accessToken) return null;
  try {
    const part = accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    if (!decoded.name || !decoded.sub) return null;
    return { name: decoded.name as string, characterId: decoded.sub.split(":")[2] };
  } catch (e) {
    console.error("Failed to parse JWT", e);
    return null;
  }
};
