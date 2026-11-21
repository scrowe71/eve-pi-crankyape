import { Env, USER_AGENT, json } from "./_shared";

const DEFAULT_PRAISAL_URL =
  "https://praisal.avanto.tk/appraisal/structured.json?persist=no";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const items = JSON.parse(await request.text());
    const response = await fetch(env.PRAISAL_URL || DEFAULT_PRAISAL_URL, {
      method: "POST",
      body: JSON.stringify({ market_name: "jita", items }),
      headers: { "User-Agent": USER_AGENT },
    });
    return json(await response.json());
  } catch (e) {
    console.error("praisal_request_failed", e);
    return json({ error: "Failed to get praisal" }, 500);
  }
};
