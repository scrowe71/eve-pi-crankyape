import { EVE_SSO_REVOKE_URL, Env, decrypt, ssoHeaders } from "./_shared";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const accessToken: any = await request.json();
  try {
    const response = await fetch(EVE_SSO_REVOKE_URL, {
      method: "POST",
      body: new URLSearchParams({
        token_type_hint: "refresh_token",
        token: decrypt(accessToken.refresh_token, env),
      }).toString(),
      headers: ssoHeaders(env),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return new Response(null, { status: 200 });
  } catch (e) {
    console.error("token_revoke_failed", e);
    return new Response(null, { status: 500 });
  }
};
