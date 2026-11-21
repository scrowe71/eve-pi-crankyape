import { EVE_SSO_TOKEN_URL, Env, decrypt, encrypt, extractCharacter, json, ssoHeaders } from "./_shared";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const accessToken: any = await request.json();

  try {
    const response = await fetch(EVE_SSO_TOKEN_URL, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: decrypt(accessToken.refresh_token, env),
      }).toString(),
      headers: ssoHeaders(env),
    });
    const data: any = await response.json();

    const character = extractCharacter(data.access_token);
    if (!character) return json({ ...accessToken, needsLogin: true });

    return json({
      access_token: data.access_token,
      token_type: data.token_type,
      refresh_token: encrypt(data.refresh_token, env),
      expires_at: Date.now() + data.expires_in * 1000,
      character,
      needsLogin: false,
      account: accessToken.account,
      comment: accessToken.comment,
      system: accessToken.system,
      planets: [],
      planetConfig: accessToken.planetConfig ?? [],
    });
  } catch (e) {
    console.error("token_refresh_failed", e);
    return json({ ...accessToken, needsLogin: true });
  }
};
