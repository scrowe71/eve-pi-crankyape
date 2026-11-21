import { Env, json } from "./_shared";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.EVE_SSO_CALLBACK_URL || !env.EVE_SSO_CLIENT_ID) {
    return json({ error: "Missing required environment variables" }, 500);
  }
  return json({
    EVE_SSO_CLIENT_ID: env.EVE_SSO_CLIENT_ID,
    EVE_SSO_CALLBACK_URL: env.EVE_SSO_CALLBACK_URL,
  });
};
