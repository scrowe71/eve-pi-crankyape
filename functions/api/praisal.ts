import { Env, USER_AGENT, json } from "./_shared";

// Prices for PI materials in Jita. Uses the original appraisal service if it
// responds, otherwise builds the same response shape from Fuzzwork's market
// aggregates for Jita 4-4 (station 60003760).
const DEFAULT_PRAISAL_URL =
  "https://praisal.avanto.tk/appraisal/structured.json?persist=no";
const FUZZWORK_URL = "https://market.fuzzwork.co.uk/aggregates/?station=60003760&types=";

type Item = { quantity: number; type_id: number };

const fromPraisal = async (items: Item[], env: Env) => {
  const response = await fetch(env.PRAISAL_URL || DEFAULT_PRAISAL_URL, {
    method: "POST",
    body: JSON.stringify({ market_name: "jita", items }),
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) throw new Error(`praisal ${response.status}`);
  const data: any = await response.json();
  if (!data?.appraisal?.items) throw new Error("praisal returned no items");
  return data;
};

const side = (s: any) => ({
  avg: Number(s?.weightedAverage ?? 0),
  max: Number(s?.max ?? 0),
  median: Number(s?.median ?? 0),
  min: Number(s?.min ?? 0),
  percentile: Number(s?.percentile ?? 0),
  stddev: Number(s?.stddev ?? 0),
  volume: Number(s?.volume ?? 0),
  order_count: Number(s?.orderCount ?? 0),
});

const fromFuzzwork = async (items: Item[]) => {
  const ids = [...new Set(items.map((i) => i.type_id))];
  const response = await fetch(FUZZWORK_URL + ids.join(","), {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) throw new Error(`fuzzwork ${response.status}`);
  const data: Record<string, any> = await response.json();
  const updated = new Date().toISOString();
  return {
    appraisal: {
      created: Math.floor(Date.now() / 1000),
      kind: "fuzzwork",
      market_name: "jita",
      totals: { buy: 0, sell: 0, volume: 0 },
      items: ids.map((id) => ({
        name: String(id),
        typeID: id,
        typeName: String(id),
        typeVolume: 0,
        quantity: 1,
        prices: {
          all: side(data[id]?.sell),
          buy: side(data[id]?.buy),
          sell: side(data[id]?.sell),
          updated,
          strategy: "fuzzwork",
        },
        meta: {},
      })),
      raw: "",
      private: true,
      live: true,
    },
  };
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let items: Item[];
  try {
    items = JSON.parse(await request.text());
  } catch {
    return json({ error: "Bad request" }, 400);
  }
  try {
    return json(await fromPraisal(items, env));
  } catch (e) {
    console.warn("praisal unavailable, using fuzzwork", String(e));
  }
  try {
    return json(await fromFuzzwork(items));
  } catch (e) {
    console.error("price lookup failed", String(e));
    return json({ error: "Failed to get prices" }, 503);
  }
};
