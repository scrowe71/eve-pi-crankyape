import { EVE_SSO_TOKEN_URL, Env, encrypt, extractCharacter, json, ssoHeaders } from "./_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const code = new URL(request.url).searchParams.get("code");
  if (!code) return new Response(null, { status: 404 });

  try {
    const response = await fetch(EVE_SSO_TOKEN_URL, {
      method: "POST",
      body: new URLSearchParams({ grant_type: "authorization_code", code }).toString(),
      headers: ssoHeaders(env),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: any = await response.json();
    const character = extractCharacter(data.access_token);
    if (!character) return new Response(null, { status: 500 });

    return json({
      access_token: data.access_token,
      token_type: data.token_type,
      refresh_token: encrypt(data.refresh_token, env),
      expires_at: Date.now() + data.expires_in * 1000,
      character,
      needsLogin: false,
      account: "-",
      comment: "",
      system: "",
      planets: [],
      planetConfig: [],
    });
  } catch (e) {
    console.error("token_request_failed", e);
    return new Response(null, { status: 500 });
  }
};
